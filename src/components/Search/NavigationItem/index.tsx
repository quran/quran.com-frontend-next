import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import Button from '@/dls/Button/Button';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getSearchNavigationResult } from '@/utils/search';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

interface Props {
  navigation: SearchNavigationResult;
  isSearchDrawer: boolean;
  service?: SearchService;
}

const NavigationItem: React.FC<Props> = ({
  navigation,
  isSearchDrawer,
  service = SearchService.QDC,
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
    ? getSearchNavigationResult(chaptersData, navigation, t, lang)
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

  return (
    <Button onClick={onNavigationItemClicked} href={url} suffix={suffix}>
      {result.name}
    </Button>
  );
};

export default NavigationItem;
