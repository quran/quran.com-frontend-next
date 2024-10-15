/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import DataContext from '@/contexts/DataContext';
import NavigateIcon from '@/icons/east.svg';
import { getSearchNavigationResult } from '@/utils/search';
import { SearchNavigationType } from 'types/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
  isVoiceSearch: boolean;
  navigationKey: string | number;
}

const CommandPrefix: React.FC<Props> = ({ name, type, isVoiceSearch, navigationKey }) => {
  const { t, lang } = useTranslation('common');
  const chapterData = useContext(DataContext);
  const getName = () => {
    if (isVoiceSearch) return name;

    if (type === SearchNavigationType.SEARCH_PAGE) {
      return t('search-for', {
        searchQuery: name,
      });
    }

    const navigation = getSearchNavigationResult(
      chapterData,
      { resultType: type, key: navigationKey, name },
      t,
      lang,
      true,
    );
    return navigation?.name;
  };

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <NavigateIcon />
      </span>
      <p
        dangerouslySetInnerHTML={{
          __html: getName(),
        }}
        className={styles.name}
      />
    </div>
  );
};

export default CommandPrefix;
