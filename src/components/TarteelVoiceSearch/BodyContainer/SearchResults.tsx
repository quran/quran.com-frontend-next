import React, { useCallback, useContext } from 'react';

import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import DataFetcher from '@/components/DataFetcher';
import CommandsList from '@/components/Search/CommandBar/CommandsList';
import TarteelSearchResultItem from '@/components/TarteelVoiceSearch/TarteelSearchResultItem';
import DataContext from '@/contexts/DataContext';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeVersesFilterUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getResultSuffix } from '@/utils/search';
import { VersesResponse } from 'types/ApiResponses';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';
import SearchResult from 'types/Tarteel/SearchResult';

interface Props {
  searchResult: SearchResult;
  isCommandBar: boolean;
}

const SearchResults: React.FC<Props> = ({ searchResult, isCommandBar }) => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);

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
    (data: VersesResponse) => {
      if (isCommandBar) {
        const toBeGroupedCommands = data.verses.map((verse) => {
          return {
            key: verse.verseKey,
            resultType: SearchNavigationType.AYAH,
            name: `${verse.textUthmani} ${getResultSuffix(
              SearchNavigationType.AYAH,
              verse.verseKey,
              lang,
              chaptersData,
            )}`,
            isVoiceSearch: true,
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
            <TarteelSearchResultItem
              key={verse.verseKey}
              result={verse}
              source={SearchQuerySource.Tarteel}
              service={SearchService.Tarteel}
            />
          ))}
        </>
      );
    },
    [chaptersData, isCommandBar, lang, t],
  );

  return <DataFetcher queryKey={makeVersesFilterUrl(params)} render={responseRender} />;
};

export default SearchResults;
