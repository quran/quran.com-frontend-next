/* eslint-disable react/no-danger */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
}

const CommandPrefix: React.FC<Props> = ({ name, type }) => {
  const { t } = useTranslation('common');
  const getContent = () => {
    if (type === SearchNavigationType.SEARCH_PAGE) {
      return t('search-for', {
        searchQuery: name,
      });
    }

    return name;
  };

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <SearchResultItemIcon type={type} />
      </span>
      <p
        className={styles.name}
        dangerouslySetInnerHTML={{
          __html: getContent(),
        }}
      />
    </div>
  );
};

export default CommandPrefix;
