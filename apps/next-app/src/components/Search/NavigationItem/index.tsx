import React from 'react';

import Button from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { resolveUrlBySearchNavigationType } from 'src/utils/navigation';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

interface Props {
  navigation: SearchNavigationResult;
  isSearchDrawer: boolean;
}

const NavigationItem: React.FC<Props> = ({ navigation, isSearchDrawer }) => {
  const url = resolveUrlBySearchNavigationType(navigation.resultType, navigation.key);
  return (
    <Button
      onClick={() => {
        logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_navigation_result`);
      }}
      href={url}
      suffix={`(${navigation.key})`}
    >
      {navigation.name}
    </Button>
  );
};

export default NavigationItem;
