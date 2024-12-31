/* eslint-disable react/no-danger */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import { Direction } from '@/utils/locale';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
  isVoiceSearch: boolean;
}

const CommandPrefix: React.FC<Props> = ({ name, type, isVoiceSearch }) => {
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
