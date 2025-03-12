/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import Language from '@/types/Language';
import { Direction } from '@/utils/locale';
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

  // Determine if we should apply RTL styling
  const isAyah = type === SearchNavigationType.AYAH;

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <SearchResultItemIcon type={type} />
      </span>
      <p
        className={classNames(styles.name, {
          [styles.rtlText]: isAyah,
        })}
        dir={isAyah ? Direction.RTL : undefined}
        lang={isAyah ? Language.AR : undefined}
        dangerouslySetInnerHTML={{
          __html: getContent(),
        }}
      />
    </div>
  );
};

export default CommandPrefix;
