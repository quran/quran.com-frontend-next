import React, { useCallback, useEffect, useState, useRef } from 'react';
import { selectNavbar, setIsSideSearchOpen } from 'src/redux/slices/navbar';
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

const SideSearch: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar).isSideSearchOpen;
  const { lang } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isInputRTL = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 1000);

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

  const closeSideSearch = useCallback(() => {
    // clear the search query before closing.
    resetQueryAndResults();
    dispatch({ type: setIsSideSearchOpen.type, payload: false });
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
        closeSideSearch();
      }
    });
  }, [closeSideSearch, router.events, isOpen]);

  return (
    <Container isOpen={isOpen}>
      <Header>
        <HeaderContentContainer>
          <HeaderContent>
            {searchQuery ? (
              <Link href={`search?query=${searchQuery}`} passHref>
                <a>
                  <Button icon={<IconSearch />} size={ButtonSize.Small} />
                </a>
              </Link>
            ) : (
              <Button icon={<IconSearch />} size={ButtonSize.Small} disabled={!searchQuery} />
            )}
            <SearchInputContainer isInputRTL={isInputRTL}>
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
            <Button icon={<IconClose />} size={ButtonSize.Small} onClick={closeSideSearch} />
          </HeaderContent>
        </HeaderContentContainer>
      </Header>
      <SideSearchBody>
        {isSearching && <div>Searching...</div>}
        {!isSearching && hasError && <div>Something went wrong!</div>}
        {!isSearching && !hasError && searchResult && (
          <div>
            <p>Results</p>
            {searchResult.search.results.map((result) => (
              <SearchResultItem key={result.verseId}>
                <SearchResultText dangerouslySetInnerHTML={{ __html: result.text }} />
                <div>VerseKey</div>
              </SearchResultItem>
            ))}
            <ResultSummaryContainer>
              <p>{searchResult.search.totalResults} results</p>
              {searchResult.search.totalResults > 0 && (
                <Link href={`search?query=${searchQuery}`} passHref>
                  <a>
                    <p>Show all results</p>
                  </a>
                </Link>
              )}
            </ResultSummaryContainer>
          </div>
        )}
      </SideSearchBody>
    </Container>
  );
};

const SearchResultText = styled.div`
  line-height: ${(props) => props.theme.lineHeights.large};
`;

const ResultSummaryContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SideSearchBody = styled.div`
  padding: ${(props) => props.theme.spacing.medium};
`;

const SearchResultItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  background-color: ${(props) => props.theme.colors.background.neutralGrey};
  padding: ${(props) => props.theme.spacing.small};
  margin-top: ${(props) => props.theme.spacing.xsmall};
  margin-bottom: ${(props) => props.theme.spacing.xsmall};
  display: flex;
  align-items: center;
  justify-content: space-between;
  direction: rtl;
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
  height: ${NAVBAR_HEIGHT};
  border-bottom: 1px ${(props) => props.theme.colors.borders.hairline} solid;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding-left: ${(props) => props.theme.spacing.medium};
  padding-right: ${(props) => props.theme.spacing.medium};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchInputContainer = styled.div<{ isInputRTL: boolean }>`
  height: 100%;
  width: 80%;
  display: flex;
  flex-direction: ${({ isInputRTL }) => (isInputRTL ? 'row-reverse' : 'row')};
  align-items: center;
  justify-content: space-between;
`;

const SearchInput = styled.input.attrs({
  type: 'text',
})`
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

export default SideSearch;
