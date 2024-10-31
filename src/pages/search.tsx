/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './search.module.scss';

import { getAvailableLanguages, getAvailableTranslations } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import TranslationsFilter from '@/components/Search/Filters/TranslationsFilter';
import SearchBodyContainer from '@/components/Search/SearchBodyContainer';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import Input, { InputVariant } from '@/dls/Forms/Input';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import FilterIcon from '@/icons/filter.svg';
import SearchIcon from '@/icons/search.svg';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick, logEvent, logValueChange } from '@/utils/eventLogger';
import filterTranslations from '@/utils/filter-translations';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import {
  addToSearchHistory,
  getDefaultTranslationIdsByLang,
  searchGetResults,
} from '@/utils/search';
import { SearchResponse } from 'types/ApiResponses';
import AvailableLanguage from 'types/AvailableLanguage';
import AvailableTranslation from 'types/AvailableTranslation';
import ChaptersData from 'types/ChaptersData';

const PAGE_SIZE = 10;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  translations: AvailableTranslation[];
  chaptersData: ChaptersData;
};

const Search: NextPage<SearchProps> = ({ translations }): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string>('');
  const [selectedTranslations, setSelectedTranslations] = useState<string>(() => {
    return getDefaultTranslationIdsByLang(translations, lang) as string;
  });
  const [translationSearchQuery, setTranslationSearchQuery] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  const dispatch = useDispatch();
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      languages: selectedLanguages,
      q: debouncedSearchQuery,
      translations: selectedTranslations,
    }),
    [currentPage, debouncedSearchQuery, selectedLanguages, selectedTranslations],
  );
  useAddQueryParamsToUrl('/search', queryParams);

  // We need this since pages that are statically optimized will be hydrated
  // without their route parameters provided, i.e query will be an empty object ({}).
  // After hydration, Next.js will trigger an update to provide the route parameters
  // in the query object. @see https://nextjs.org/docs/routing/dynamic-routes#caveats
  useEffect(() => {
    // we don't want to focus the main search input when the translation filter modal is open.
    if (router.isReady && !isContentModalOpen) {
      focusInput();
    }
  }, [focusInput, router, isContentModalOpen]);

  // handle when language changes
  useEffect(() => {
    setSelectedTranslations(getDefaultTranslationIdsByLang(translations, lang) as string);
  }, [lang, translations]);

  useEffect(() => {
    if (router.query.q || router.query.query) {
      let query = router.query.q as string;
      if (router.query.query) {
        query = router.query.query as string;
      }
      setSearchQuery(query);
    }

    if (router.query.page) {
      setCurrentPage(Number(router.query.page));
    }
    if (router.query.languages) {
      setSelectedLanguages(router.query.languages as string);
    }
    if (router.query.translations) {
      setSelectedTranslations(router.query.translations as string);
    }
  }, [
    router.query.q,
    router.query.query,
    router.query.page,
    router.query.languages,
    router.query.translations,
  ]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    setSearchQuery(newSearchQuery || '');
  };

  const onClearClicked = () => {
    logButtonClick('search_page_clear_query');
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
      searchGetResults(
        SearchQuerySource.SearchPage,
        query,
        page,
        PAGE_SIZE,
        setIsSearching,
        setHasError,
        setSearchResult,
        language,
        translation,
      );
    },
    [],
  );

  // a ref to know whether this is the initial search request made when the user loads the page or not
  const isInitialSearch = useRef(true);

  // listen to any changes in the API params and call BE on change.
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      // we don't want to reset pagination when the user reloads the page with a ?page={number} in the url query
      if (!isInitialSearch.current) {
        setCurrentPage(1);
      }

      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchPage);

      getResults(
        debouncedSearchQuery,
        // if it is the initial search request, use the page number in the url, otherwise, reset it
        isInitialSearch.current ? currentPage : 1,
        selectedTranslations,
        selectedLanguages,
      );

      // if it was the initial request, update the ref
      if (isInitialSearch.current) {
        isInitialSearch.current = false;
      }
    }
    // we don't want to run this effect when currentPage is changed
    // because we are already handeling this in onPageChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, getResults, selectedLanguages, selectedTranslations]);

  const onPageChange = (page: number) => {
    logEvent('search_page_number_change', { page });
    setCurrentPage(page);
    getResults(debouncedSearchQuery, page, selectedTranslations, selectedLanguages);
  };

  const onTranslationChange = useCallback((translationIds: string[]) => {
    // convert the array into a string
    setSelectedTranslations((prevTranslationIds) => {
      // filter out the empty strings
      const newTranslationIds = translationIds.filter((id) => id !== '').join(',');
      logValueChange('search_page_selected_translations', prevTranslationIds, newTranslationIds);
      return newTranslationIds;
    });
    // reset the current page since most probable the results will change.
    setCurrentPage(1);
  }, []);

  const onSearchKeywordClicked = useCallback((keyword: string) => {
    setSearchQuery(keyword);
  }, []);

  const navigationUrl = '/search';

  const formattedSelectedTranslations = useMemo(() => {
    if (!selectedTranslations) return t('search:default-translations');

    let selectedValueString;

    const selectedTranslationsArray = selectedTranslations.split(',');

    const firstSelectedTranslation = translations.find(
      (translation) => translation.id.toString() === selectedTranslationsArray[0],
    );

    if (!firstSelectedTranslation) return t('search:all-translations');

    if (selectedTranslationsArray.length === 1) {
      selectedValueString = firstSelectedTranslation.name;
    }
    if (selectedTranslationsArray.length === 2) {
      selectedValueString = t('settings.value-and-other', {
        value: firstSelectedTranslation?.name,
        othersCount: toLocalizedNumber(selectedTranslationsArray.length - 1, lang),
      });
    }
    if (selectedTranslationsArray.length > 2) {
      selectedValueString = t('settings.value-and-others', {
        value: firstSelectedTranslation?.name,
        othersCount: toLocalizedNumber(selectedTranslationsArray.length - 1, lang),
      });
    }

    return selectedValueString;
  }, [lang, selectedTranslations, t, translations]);

  const filteredTranslations = translationSearchQuery
    ? filterTranslations(translations, translationSearchQuery)
    : translations;

  const onResetButtonClicked = () => {
    logButtonClick('search_page_reset_button');
    const defaultLangTranslationIds = getDefaultTranslationIdsByLang(
      translations,
      lang,
      false,
    ) as string[];
    onTranslationChange(defaultLangTranslationIds);
  };

  const onTranslationSearchQueryChange = (newTranslationSearchQuery: string) => {
    logValueChange(
      'search_page_translation_search_query',
      translationSearchQuery,
      newTranslationSearchQuery,
    );
    setTranslationSearchQuery(newTranslationSearchQuery);
  };

  const onTranslationSearchClearClicked = () => {
    logButtonClick('search_page_translation_search_clear');
    setTranslationSearchQuery('');
  };

  const onTranslationsFiltersClicked = () => {
    logButtonClick('search_page_translation_filter');
    setIsContentModalOpen(true);
  };

  return (
    <>
      <NextSeoWrapper
        title={
          debouncedSearchQuery !== ''
            ? t('search:search-title', {
                searchQuery: debouncedSearchQuery,
              })
            : t('search:search')
        }
        description={t('search:search-desc')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      <div className={styles.pageContainer}>
        <div className={styles.headerOuterContainer}>
          <div className={styles.headerInnerContainer}>
            <Input
              id="searchQuery"
              prefix={<SearchIcon />}
              onChange={onSearchQueryChange}
              onClearClicked={onClearClicked}
              inputRef={searchInputRef}
              clearable
              value={searchQuery}
              disabled={isSearching}
              placeholder={t('search.title')}
              fixedWidth={false}
              variant={InputVariant.Main}
            />
            <ContentModal
              size={ContentModalSize.SMALL}
              isFixedHeight
              header={
                <div className={styles.modalContainer}>
                  <div className={styles.translationSearchContainer}>
                    <Input
                      id="searchQuery"
                      prefix={<SearchIcon />}
                      onChange={onTranslationSearchQueryChange}
                      onClearClicked={onTranslationSearchClearClicked}
                      clearable
                      value={translationSearchQuery}
                      placeholder={t('settings.search-translations')}
                      fixedWidth={false}
                      variant={InputVariant.Main}
                    />
                  </div>
                  <Button
                    className={styles.resetButton}
                    variant={ButtonVariant.Ghost}
                    onClick={onResetButtonClicked}
                  >
                    {t('search:reset')}
                  </Button>
                </div>
              }
              isOpen={isContentModalOpen}
              onClose={() => setIsContentModalOpen(false)}
            >
              <TranslationsFilter
                translations={filteredTranslations}
                selectedTranslations={selectedTranslations}
                onTranslationChange={onTranslationChange}
              />
            </ContentModal>
            <div className={styles.filtersContainer}>
              <Button
                onClick={onTranslationsFiltersClicked}
                size={ButtonSize.Small}
                variant={ButtonVariant.Compact}
                prefix={<FilterIcon />}
                className={styles.filterButton}
              >
                {t('search:filter')}
              </Button>
              <div>
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <span className={styles.searching}>{t('search:searching-translations')}: </span>
                {formattedSelectedTranslations}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.pageBody}>
          <div className={styles.searchBodyContainer}>
            <SearchBodyContainer
              onSearchKeywordClicked={onSearchKeywordClicked}
              isSearchDrawer={false}
              searchQuery={debouncedSearchQuery}
              searchResult={searchResult}
              currentPage={currentPage}
              onPageChange={onPageChange}
              pageSize={PAGE_SIZE}
              isSearching={isSearching}
              hasError={hasError}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const [availableLanguagesResponse, availableTranslationsResponse] = await Promise.all([
      getAvailableLanguages(locale, true),
      getAvailableTranslations(locale, true),
    ]);

    let translations = [];
    let languages = [];
    if (availableLanguagesResponse.status !== 500) {
      const { languages: responseLanguages } = availableLanguagesResponse;
      languages = responseLanguages;
    }
    if (availableTranslationsResponse.status !== 500) {
      const { translations: responseTranslations } = availableTranslationsResponse;
      translations = responseTranslations;
    }
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
        languages,
        translations,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      props: {
        hasError: true,
      },
    };
  }
};

export default Search;
