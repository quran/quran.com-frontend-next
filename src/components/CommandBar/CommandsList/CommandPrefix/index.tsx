/* eslint-disable react/no-danger */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import NavigateIcon from '@/icons/east.svg';
import { SearchNavigationType } from 'types/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
}

const CommandPrefix: React.FC<Props> = ({ name, type }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <NavigateIcon />
      </span>
      <p className={styles.name}>
        <div
          dangerouslySetInnerHTML={{
            __html:
              type === SearchNavigationType.SEARCH_PAGE
                ? t('search-for', {
                    searchQuery: name,
                  })
                : name,
          }}
          className={styles.name}
        />
      </p>
    </div>
  );
};

export default CommandPrefix;
