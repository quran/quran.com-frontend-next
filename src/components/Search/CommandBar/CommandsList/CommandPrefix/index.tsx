/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import DataContext from '@/contexts/DataContext';
import { Direction } from '@/utils/locale';
import { getSearchNavigationResult } from '@/utils/search';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
  isVoiceSearch: boolean;
  navigationKey: string | number;
}

const CommandPrefix: React.FC<Props> = ({ name, type, isVoiceSearch, navigationKey }) => {
  const { t, lang } = useTranslation('common');
  const chapterData = useContext(DataContext);
  const getContent = () => {
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
    );
    return navigation?.name;
  };

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <SearchResultItemIcon type={type} />
      </span>
      {isVoiceSearch ? (
        <div dir={Direction.RTL}>{name}</div>
      ) : (
        <p
          className={styles.name}
          dangerouslySetInnerHTML={{
            __html: getContent(),
          }}
        />
      )}
    </div>
  );
};

export default CommandPrefix;
