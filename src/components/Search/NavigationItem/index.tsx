import React from 'react';
import { SearchNavigationResult } from 'types/SearchNavigationResult';
import Link from 'next/link';
import { resolveUrlBySearchNavigationType } from 'src/utils/navigation';
import styles from './NavigationItem.module.scss';

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
