/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import KalimatNavigationSearchResultItem from '../SearchResults/KalimatNavigationSearchResultItem';

import DataContext from '@/contexts/DataContext';
import Button from '@/dls/Button/Button';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getSearchNavigationResult } from '@/utils/search';
import { SearchNavigationResult, SearchNavigationType } from 'types/Search/SearchNavigationResult';

interface Props {
  navigation: SearchNavigationResult;
  isSearchDrawer: boolean;
  service?: SearchService;
}

const NavigationItem: React.FC<Props> = ({
  navigation,
  isSearchDrawer,
  service = SearchService.KALIMAT,
}) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const isKalimatService = service === SearchService.KALIMAT;
  const url = resolveUrlBySearchNavigationType(
    navigation.resultType,
    navigation.key,
    isKalimatService,
  );

  const result = isKalimatService
    ? getSearchNavigationResult(chaptersData, navigation, t, lang, true)
    : navigation;
  const getKalimatResultSuffix = () => {
    if (navigation.resultType === SearchNavigationType.SURAH) {
      return `(${toLocalizedNumber(Number(result.key), lang)})`;
    }

    if (navigation.resultType === SearchNavigationType.AYAH) {
      return `(${toLocalizedVerseKey(result.key as string, lang)})`;
    }

    return undefined;
  };

  const suffix = isKalimatService ? getKalimatResultSuffix() : `(${navigation.key})`;

  const onNavigationItemClicked = () => {
    logButtonClick('search_navigation_result', {
      type: navigation.resultType,
      service,
      source: isSearchDrawer ? SearchQuerySource.SearchDrawer : SearchQuerySource.SearchPage,
    });
  };

  if (isKalimatService && result.resultType === SearchNavigationType.AYAH) {
    return (
      <KalimatNavigationSearchResultItem
        key={result.key}
        name={result.name}
        resultKey={result.key}
        source={isSearchDrawer ? SearchQuerySource.SearchDrawer : SearchQuerySource.SearchPage}
      />
    );
  }

  return (
    <Button onClick={onNavigationItemClicked} href={url} suffix={suffix}>
      {result.name}
    </Button>
  );
};

export default NavigationItem;
