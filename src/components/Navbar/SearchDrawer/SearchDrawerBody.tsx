import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import SearchResultItem from 'src/components/Search/SearchResultItem';
import { NAVBAR_HEIGHT } from 'src/styles/constants';
import { SearchResponse } from 'types/APIResponses';

interface Props {
  isSearching: boolean;
  hasError: boolean;
  searchQuery: string;
  searchResult: SearchResponse;
}

const SearchDrawerBody: React.FC<Props> = ({
  isSearching,
  hasError,
  searchResult,
  searchQuery,
}) => {
  return (
    <Container>
      {isSearching && <div>Searching...</div>}
      {!isSearching && hasError && <div>Something went wrong!</div>}
      {!isSearching && !hasError && searchResult && (
        <div>
          <p>Results</p>
          {searchResult.search.results.map((result) => (
            <SearchResultItem key={result.verseId} result={result} />
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
    </Container>
  );
};

const ResultSummaryContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  margin-top: ${NAVBAR_HEIGHT};
  padding: ${(props) => props.theme.spacing.medium};
`;

export default SearchDrawerBody;
