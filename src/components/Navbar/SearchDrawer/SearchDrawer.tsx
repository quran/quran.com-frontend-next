import React, { useCallback, useEffect, useState, useRef } from 'react';
import { selectNavbar, setIsSearchDrawerOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { SIDE_MENU_DESKTOP_WIDTH, NAVBAR_HEIGHT } from 'src/styles/constants';
import Link from 'next/link';
import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import { getSearchResults } from 'src/api';
import { SearchResponse } from 'types/APIResponses';
import useDebounce from 'src/hooks/useDebounce';
import IconClose from '../../../../public/icons/close.svg';
import IconSearch from '../../../../public/icons/search.svg';

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar).isSearchDrawerOpen;
  const { lang } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);

  // This useEffect is triggered when the debouncedSearchQuery value changes
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      setIsSearching(true);
      getSearchResults({
        query: debouncedSearchQuery,
        language: lang,
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
    } else {
      // reset the result
      setSearchResult(null);
    }
  }, [lang, debouncedSearchQuery]);

  const resetQueryAndResults = () => {
    // reset the search query
    setSearchQuery('');
    // reset the result
    setSearchResult(null);
    // reset the error
    setHasError(false);
  };

  const closeSearchDrawer = useCallback(() => {
    dispatch({ type: setIsSearchDrawerOpen.type, payload: false });
  }, [dispatch]);

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    if (!newSearchQuery) {
      resetQueryAndResults();
    } else {
      setSearchQuery(newSearchQuery);
    }
  };

  // Hide navbar after successful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen) {
        closeSearchDrawer();
      }
    });
  }, [closeSearchDrawer, router.events, isOpen]);

  // TODO: add the translation section.
  return (
    <Container isOpen={isOpen}>
      <Header>
        <HeaderContentContainer>
          <HeaderContent>
            <Button
              icon={<IconSearch />}
              size={ButtonSize.Small}
              disabled={!searchQuery}
              href={`/search?query=${searchQuery}`}
            />
            <SearchInputContainer isRTLInput={isRTLInput}>
              <SearchInput
                ref={searchInputRef}
                dir="auto"
                placeholder="Search"
                onChange={onSearchQueryChange}
                value={searchQuery}
                disabled={isSearching}
              />
              {searchQuery && <StyledClear onClick={resetQueryAndResults}>Clear</StyledClear>}
            </SearchInputContainer>
            <Button icon={<IconClose />} size={ButtonSize.Small} onClick={closeSearchDrawer} />
          </HeaderContent>
        </HeaderContentContainer>
      </Header>
      <SearchDrawerBody>
        {isSearching && <div>Searching...</div>}
        {!isSearching && hasError && <div>Something went wrong!</div>}
        {!isSearching && !hasError && searchResult && (
          <div>
            <p>Results</p>
            {searchResult.search.results.map((result) => (
              <SearchResultItem key={result.verseId}>
                <QuranTextContainer>
                  <div>VerseKey</div>
                  <SearchResultText dangerouslySetInnerHTML={{ __html: result.text }} />
                </QuranTextContainer>
                {result.translations.map((translation) => (
                  <TranslationContainer key={translation.id}>
                    <div dangerouslySetInnerHTML={{ __html: translation.text }} />
                    <TranslationName>{translation.name}</TranslationName>
                  </TranslationContainer>
                ))}
              </SearchResultItem>
            ))}
            <ResultSummaryContainer>
              <p>{searchResult.search.totalResults} results</p>
              {searchResult.search.totalResults > 0 && (
                <Link href={`/search?query=${searchQuery}`} passHref>
                  <a>
                    <p>Show all results</p>
                  </a>
                </Link>
              )}
            </ResultSummaryContainer>
          </div>
        )}
      </SearchDrawerBody>
    </Container>
  );
};

const TranslationName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.normal};
  color: ${({ theme }) => theme.colors.text.default};
`;

const TranslationContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.small} 0;
`;

const QuranTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchResultText = styled.div`
  line-height: ${(props) => props.theme.lineHeights.large};
  direction: rtl;
`;

const ResultSummaryContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchDrawerBody = styled.div`
  margin-top: ${NAVBAR_HEIGHT};
  padding: ${(props) => props.theme.spacing.medium};
`;

const SearchResultItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  background-color: ${(props) => props.theme.colors.background.neutralGrey};
  padding: ${(props) => props.theme.spacing.small};
  margin-top: ${(props) => props.theme.spacing.xsmall};
  margin-bottom: ${(props) => props.theme.spacing.xsmall};
`;

const Container = styled.div<{ isOpen: boolean }>`
  background: ${(props) => props.theme.colors.background.default};
  position: fixed;
  height: 100vh;
  width: 100%;
  right: ${(props) => (props.isOpen ? 0 : '-100%')};
  top: 0;
  bottom: 0;
  z-index: ${(props) => props.theme.zIndexes.header};
  transition: ${(props) => props.theme.transitions.regular};
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior-y: contain;

  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: ${SIDE_MENU_DESKTOP_WIDTH};
    right: ${(props) => (props.isOpen ? 0 : `-${SIDE_MENU_DESKTOP_WIDTH}`)};
  }
`;

const Header = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.background.default};
  position: fixed;
  height: ${NAVBAR_HEIGHT};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
  padding: 0 ${(props) => props.theme.spacing.medium};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: ${SIDE_MENU_DESKTOP_WIDTH};
  }
`;

const HeaderContentContainer = styled.div`
  margin-right: ${(props) => props.theme.spacing.medium};
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchInputContainer = styled.div<{ isRTLInput: boolean }>`
  height: 100%;
  width: 80%;
  display: flex;
  flex-direction: ${({ isRTLInput }) => (isRTLInput ? 'row-reverse' : 'row')};
  align-items: center;
  justify-content: space-between;
`;

const SearchInput = styled.input.attrs({
  type: 'text',
})`
  width: 100%;
  border: 0;
  &:focus {
    outline: none;
  }
  &:disabled {
    background: none;
  }
`;

const StyledClear = styled.p`
  text-transform: uppercase;
  text-decoration: underline;
  cursor: pointer;
  font-size: ${(props) => props.theme.fontSizes.normal};
`;

export default SearchDrawer;
