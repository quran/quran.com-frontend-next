import React from 'react';

import SearchResultItem from 'src/components/Search/SearchResults/SearchResultItem';
import SearchResult from 'types/Tarteel/SearchResult';

interface Props {
  searchResult: SearchResult;
}

const SearchResults: React.FC<Props> = ({ searchResult }) => {
  return (
    <div>
      {searchResult.matches.map((match) => {
        const verseKey = `${match.surahNum}:${match.ayahNum}`;
        const result = {
          verseKey,
          words: match.arabicAyah.split(' ').map((word) => ({
            verseKey,
            text: word,
          })),
        };
        // @ts-ignore
        return <SearchResultItem key={verseKey} result={result} />;
      })}
    </div>
  );
};

export default SearchResults;
