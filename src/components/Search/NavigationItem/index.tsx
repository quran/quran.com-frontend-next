import React from 'react';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';
import Link from 'next/link';
import { getVerseNavigationUrl } from 'src/utils/verse';
import styles from './NavigationItem.module.scss';

interface Props {
  navigation: SearchNavigationResult;
}

const NavigationItem: React.FC<Props> = ({ navigation }) => {
  const url = resolveUrlByType(navigation.resultType, navigation.key);
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

/**
 * Generate the navigation url based on the type.
 *
 * @param {SearchNavigationType} type
 * @param {string | number} key
 * @returns {string}
 */
const resolveUrlByType = (type: SearchNavigationType, key: string | number): string => {
  const stringKey = String(key);
  if (type === SearchNavigationType.AYAH) {
    return getVerseNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.JUZ) {
    return `/juz/${key}`;
  }
  if (type === SearchNavigationType.PAGE) {
    return `/page/${key}`;
  }
  // for the Surah navigation
  return `/${key}`;
};

export default NavigationItem;
