import React, { RefObject } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import DrawerSearchIcon from '../Buttons/DrawerSearchIcon';

import styles from './Header.module.scss';

import Separator from '@/dls/Separator/Separator';

interface Props {
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (event: React.FormEvent<HTMLInputElement>) => void;
  resetQueryAndResults: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

const Header: React.FC<Props> = ({
  onSearchQueryChange,
  resetQueryAndResults,
  inputRef,
  isSearching,
  searchQuery,
}) => {
  const { t } = useTranslation('common');

  const onKeyboardReturnPressed = (e) => {
    e.preventDefault();
    inputRef.current.blur();
  };

  return (
    <>
      <DrawerSearchIcon />
      <div className={classNames(styles.searchInputContainer)}>
        <form onSubmit={onKeyboardReturnPressed}>
          <input
            className={styles.searchInput}
            type="text"
            ref={inputRef}
            dir="auto"
            placeholder={t('search.title')}
            onChange={onSearchQueryChange}
            value={searchQuery}
            disabled={isSearching}
          />
        </form>
        {searchQuery && (
          <>
            <button type="button" className={styles.clear} onClick={resetQueryAndResults}>
              {t('input.clear')}
            </button>
            <Separator isVertical className={styles.separator} />
          </>
        )}
      </div>
    </>
  );
};

export default Header;
