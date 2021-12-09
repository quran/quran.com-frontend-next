import React, { useCallback } from 'react';

import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CommandsList from 'src/components/CommandBar/CommandsList';
import DataFetcher from 'src/components/DataFetcher';
import SearchResultItem from 'src/components/Search/SearchResults/SearchResultItem';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { makeVersesFilterUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { shortenVerseText } from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import { SearchNavigationType } from 'types/SearchNavigationResult';
import SearchResult from 'types/Tarteel/SearchResult';

interface Props {
  searchResult: SearchResult;
  isCommandBar: boolean;
}

const SearchResults: React.FC<Props> = ({ searchResult, isCommandBar }) => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { t, lang } = useTranslation('common');
  const params = {
    filters: searchResult.matches.map((match) => `${match.surahNum}:${match.ayahNum}`).join(','),
    fields: 'text_uthmani',
    // when it's the search drawer
    ...(!isCommandBar && {
      words: true,
      // when there is a translation in Redux
      ...(!!selectedTranslations.length && {
        translations: selectedTranslations.join(','),
        translationFields: 'text,resource_id,resource_name',
      }),
    }),
  };

  const responseRender = useCallback(
    (data: VersesResponse) => {
      if (isCommandBar) {
        const toBeGroupedCommands = data.verses.map((verse) => {
          return {
            key: verse.verseKey,
            resultType: SearchNavigationType.AYAH,
            name: `[${toLocalizedVerseKey(verse.verseKey, lang)}] ${shortenVerseText(
              verse.textUthmani,
              80,
            )}`,
            group: t('command-bar.navigations'),
          };
        });

        return (
          <CommandsList
            commandGroups={{
              groups: groupBy(
                toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
                (item) => item.group, // we group by the group name that has been attached to each command.
              ),
              numberOfCommands: data.verses.length, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
            }}
          />
        );
      }
      return (
        <>
          {data.verses.map((verse) => (
            <SearchResultItem key={verse.verseKey} result={verse} />
          ))}
        </>
      );
    },
    [isCommandBar, lang, t],
  );

  return <DataFetcher queryKey={makeVersesFilterUrl(params)} render={responseRender} />;
};

export default SearchResults;
