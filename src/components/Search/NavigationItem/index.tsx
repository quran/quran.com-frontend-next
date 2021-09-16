import React from 'react';

import Link from 'next/link';

import styles from './NavigationItem.module.scss';

import { resolveUrlBySearchNavigationType } from 'src/utils/navigation';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

interface Props {
  navigation: SearchNavigationResult;
}

const NavigationItem: React.FC<Props> = ({ navigation }) => {
  const url = resolveUrlBySearchNavigationType(navigation.resultType, navigation.key);
  return (
    <Link href={url} passHref>
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
