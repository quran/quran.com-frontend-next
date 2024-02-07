import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import Button from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getSearchNavigationResult } from '@/utils/search';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

interface Props {
  navigation: SearchNavigationResult;
  isSearchDrawer: boolean;
}

const NavigationItem: React.FC<Props> = ({ navigation, isSearchDrawer }) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);

  const url = resolveUrlBySearchNavigationType(navigation.resultType, navigation.key);
  const result = getSearchNavigationResult(chaptersData, navigation, t, lang);

  const getSuffix = () => {
    if (navigation.resultType === SearchNavigationType.SURAH) {
      return `(${toLocalizedNumber(Number(result.key), lang)})`;
    }

    if (navigation.resultType === SearchNavigationType.AYAH) {
      return `(${toLocalizedVerseKey(result.key, lang)})`;
    }

    return undefined;
  };

  return (
    <Button
      onClick={() => {
        logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_navigation_result`);
      }}
      href={url}
      suffix={getSuffix()}
    >
      {result.name}
    </Button>
  );
};

export default NavigationItem;
