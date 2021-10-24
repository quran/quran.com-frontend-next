import React from 'react';

import groupBy from 'lodash/groupBy';

import CommandsList from 'src/components/CommandBar/CommandsList';
import SearchResultItem from 'src/components/Search/SearchResults/SearchResultItem';
import { SearchNavigationType } from 'types/SearchNavigationResult';
import SearchResult from 'types/Tarteel/SearchResult';

interface Props {
  searchResult: SearchResult;
  isCommandBar: boolean;
}

const SearchResults: React.FC<Props> = ({ searchResult, isCommandBar }) => {
  if (isCommandBar) {
    const toBeGroupedCommands = searchResult.matches.map((match) => {
      return {
        key: `${match.surahNum}:${match.ayahNum}`,
        resultType: SearchNavigationType.AYAH,
        name: match.arabicAyah,
        group: 'Navigations',
      };
    });

    return (
      <CommandsList
        commandGroups={{
          groups: groupBy(
            toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
            (item) => item.group, // we group by the group name that has been attached to each command.
          ),
          numberOfCommands: searchResult.matches.length, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
        }}
      />
    );
  }

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
