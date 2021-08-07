import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GetStaticProps, NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import useTranslation from 'next-translate/useTranslation';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import Pagination from 'src/components/dls/Pagination/Pagination';
import { getAvailableLanguages, getAvailableTranslations, getSearchResults } from 'src/api';
import { SearchResponse } from 'types/APIResponses';
import useAddQueryParamsToUrl from 'src/hooks/useAddQueryParamsToUrl';
import useDebounce from 'src/hooks/useDebounce';
import TranslationsFilter from 'src/components/Search/TranslationsFilter';
import LanguagesFilter from 'src/components/Search/LanguagesFilter';
import SearchResultItem from 'src/components/Search/SearchResultItem';
import AvailableTranslation from 'types/AvailableTranslation';
import AvailableLanguage from 'types/AvailableLanguage';
import NextSeoHead from 'src/components/NextSeoHead';
import IconClose from '../../public/icons/close.svg';

const PAGE_SIZE = 20;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  translations: AvailableTranslation[];
};

const Search: NextPage<SearchProps> = ({ languages, translations }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { lang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(lang);
  const [selectedTranslation, setSelectedTranslation] = useState<string>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      language: selectedLanguage,
      query: debouncedSearchQuery,
      translation: selectedTranslation,
    }),
    [currentPage, debouncedSearchQuery, selectedLanguage, selectedTranslation],
  );
  useAddQueryParamsToUrl('/search', queryParams);

  // We need this since pages that are statically optimized will be hydrated
  // without their route parameters provided, i.e query will be an empty object ({}).
  // After hydration, Next.js will trigger an update to provide the route parameters
  // in the query object. @see https://nextjs.org/docs/routing/dynamic-routes#caveats
  useEffect(() => {
    if (router.isReady) {
      if (router.query.query) {
        setSearchQuery(router.query.query as string);
      }
      if (router.query.page) {
        setCurrentPage(Number(router.query.page));
      }
      if (router.query.language) {
        setSelectedLanguage(router.query.language as string);
      }
      if (router.query.translation) {
        setSelectedTranslation(router.query.translation as string);
      }
    }
  }, [router]);

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    if (!newSearchQuery) {
      setSearchQuery('');
    } else {
      setSearchQuery(newSearchQuery);
    }
  };

  const onClearClicked = () => {
    setSearchQuery('');
  };

  /**
   * Call BE to fetch the results using the passed filters.
   *
   * @param {string} query
   * @param {number} page
   * @param {string} translation
   * @param {string} language
   */
  const getResults = useCallback(
    (query: string, page: number, translation: string, language: string) => {
      setIsSearching(true);
      getSearchResults({
        query,
        language,
        size: PAGE_SIZE,
        page: page - 1, // the API starts the pagination at 0.
      })
        .then((response) => {
          if (response.status === 500) {
            setHasError(true);
          } else {
            setSearchResult(response);
          }
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    },
    [],
  );

  // listen to any changes in the API params and call BE on change.
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      getResults(debouncedSearchQuery, currentPage, selectedTranslation, selectedLanguage);
    }
  }, [currentPage, debouncedSearchQuery, getResults, selectedLanguage, selectedTranslation]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle when the selected language changes.
   *
   * @param {string} languageIsoCode
   */
  const onLanguageChange = useCallback((languageIsoCode: string) => {
    setSelectedLanguage(languageIsoCode);
  }, []);

  const onTranslationChange = useCallback((translationId: string) => {
    setSelectedTranslation(translationId);
    // reset the current page since most probable the results will change.
    setCurrentPage(1);
  }, []);

  return (
    <>
      <NextSeoHead title={debouncedSearchQuery} />
      <StyledPage>
        <PageHeader>Search</PageHeader>
        <SearchInputContainer isRTLInput={isRTLInput}>
          <SearchInput
            ref={searchInputRef}
            dir="auto"
            placeholder="Search"
            onChange={onSearchQueryChange}
            value={searchQuery}
            disabled={isSearching}
          />
          {searchQuery && (
            <Button icon={<IconClose />} size={ButtonSize.XSmall} onClick={onClearClicked} />
          )}
        </SearchInputContainer>
        <PageBody>
          <FiltersContainer>
            <BoldHeader>Filters</BoldHeader>
            <LanguagesFilter
              languages={languages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
            />
            <TranslationsFilter
              translations={translations}
              selectedTranslation={selectedTranslation}
              onTranslationChange={onTranslationChange}
            />
          </FiltersContainer>
          <BodyContainer>
            {isSearching && <div>Searching...</div>}
            {!isSearching && hasError && <div>Something went wrong, please try again!</div>}
            {!isSearching && !hasError && searchResult && (
              <div>
                <BoldHeader>Results</BoldHeader>
                {searchResult.search.results.length === 0 && <p>No results found!</p>}
                {searchResult.search.results.map((result) => (
                  <SearchResultItem key={result.verseId} result={result} />
                ))}
                <PaginationContainer>
                  {debouncedSearchQuery && (
                    <Pagination
                      currentPage={currentPage}
                      totalCount={searchResult.search.totalResults}
                      onPageChange={onPageChange}
                      pageSize={PAGE_SIZE}
                    />
                  )}
                </PaginationContainer>
              </div>
            )}
          </BodyContainer>
        </PageBody>
      </StyledPage>
    </>
  );
};

const PaginationContainer = styled.div`
  min-height: calc(2 * ${({ theme }) => theme.spacing.mega});
`;

const BodyContainer = styled.div`
  width: 70%;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    width: auto;
  }
`;

const BoldHeader = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const FiltersContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${({ theme }) => theme.borderRadiuses.default};
  background-color: ${({ theme }) => theme.colors.background.neutralGrey};
  min-height: ${({ theme }) => `calc(6*${theme.spacing.mega})`};
  margin-right: ${({ theme }) => theme.spacing.xsmall};
  width: 30%;
  padding: ${({ theme }) => theme.spacing.small};
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    width: auto;
    margin: ${({ theme }) => theme.spacing.xsmall} 0;
  }
`;

const PageHeader = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: ${({ theme }) => theme.spacing.medium} 0;
  font-size: ${({ theme }) => theme.fontSizes.jumbo};
`;

const SearchInputContainer = styled.div<{ isRTLInput: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${({ theme }) => theme.borderRadiuses.pill};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: ${({ isRTLInput }) => (isRTLInput ? 'row-reverse' : 'row')};
  align-items: center;
  justify-content: space-between;
  height: ${({ theme }) => theme.spacing.large};
  margin: ${({ theme }) => theme.spacing.medium} 0;
`;

const SearchInput = styled.input.attrs({
  type: 'text',
})`
  border: 0;
  width: 90%;
  font-size: ${({ theme }) => theme.fontSizes.large};
  &:focus {
    outline: none;
  }
  &:disabled {
    background: none;
  }
`;

const StyledPage = styled.div`
  padding-top: calc(2 * ${({ theme }) => theme.spacing.mega});
  width: 70%;
  margin: 0 auto;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    width: 90%;
  }
`;

const PageBody = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: center;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    display: block;
  }
`;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const [availableLanguagesResponse, availableTranslationsResponse] = await Promise.all([
    getAvailableLanguages(locale),
    getAvailableTranslations(locale),
  ]);

  let translations = [];
  let languages = [];
  if (availableLanguagesResponse.status !== 500) {
    languages = availableLanguagesResponse.languages;
  }
  if (availableTranslationsResponse.status !== 500) {
    translations = availableTranslationsResponse.translations;
  }

  return {
    props: {
      languages,
      translations,
    },
  };
};

export default Search;
