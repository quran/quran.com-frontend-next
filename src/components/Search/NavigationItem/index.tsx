import React from 'react';

import styles from './NavigationItem.module.scss';

import Link from 'src/components/dls/Link/Link';
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
    <Link
      href={url}
      shouldPassHref
      onClick={() => {
        logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_navigation_result`);
      }}
    >
      <a className={styles.link}>
        <div className={styles.container}>
          <p className={styles.key}>{navigation.key}</p>
          <div className={styles.name}>{navigation.name}</div>
        </div>
      </a>
    </Link>
  );
};

export default NavigationItem;
