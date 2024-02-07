import React, { useCallback } from 'react';

import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CommandsList from '@/components/CommandBar/CommandsList';
import DataFetcher from '@/components/DataFetcher';
import SearchResultItem, { Source } from '@/components/Search/SearchResults/SearchResultItem';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { VersesResponse } from '@/types/ApiResponses';
import SearchResponse from '@/types/Search/SearchResponse';
import { makeVersesFilterUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { toLocalizedVerseKey } from '@/utils/locale';
import { truncateString } from '@/utils/string';
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
    // only get the first 10 results
    filters: searchResult.matches
      .slice(0, 10)
      .map((match) => `${match.surahNum}:${match.ayahNum}`)
      .join(','),
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
    (response: SearchResponse | VersesResponse) => {
      const verses = 'result' in response ? response.result.verses : response.verses;

      if (isCommandBar) {
        const toBeGroupedCommands = verses.map((verse) => {
          return {
            key: verse.verseKey,
            resultType: SearchNavigationType.AYAH,
            name: `[${toLocalizedVerseKey(verse.verseKey, lang)}] ${truncateString(
              verse.textUthmani,
              80,
            )}`,
            group: t('command-bar.navigations'),
            isVoiceSearch: true,
          };
        });

        return (
          <CommandsList
            commandGroups={{
              groups: groupBy(
                toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
                (item) => item.group, // we group by the group name that has been attached to each command.
              ),
              numberOfCommands: verses.length, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
            }}
          />
        );
      }

      return (
        <>
          {verses.map((verse) => (
            <SearchResultItem key={verse.verseKey} result={verse} source={Source.Tarteel} />
          ))}
        </>
      );
    },
    [isCommandBar, lang, t],
  );

  return <DataFetcher queryKey={makeVersesFilterUrl(params)} render={responseRender} />;
};

export default SearchResults;
