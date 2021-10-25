import React, { RefObject } from 'react';

import classNames from 'classnames';

import DrawerSearchIcon from '../Buttons/DrawerSearchIcon';

import styles from './Header.module.scss';

import TarteelVoiceSearchTrigger from 'src/components/TarteelVoiceSearch/Trigger';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';

interface Props {
  isVoiceFlowStarted: boolean;
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (event: React.FormEvent<HTMLInputElement>) => void;
  resetQueryAndResults: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

const Header: React.FC<Props> = ({
  isVoiceFlowStarted,
  onSearchQueryChange,
  resetQueryAndResults,
  inputRef,
  isSearching,
  searchQuery,
}) => {
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(inputRef, 'direction') === 'rtl';
  return (
    <>
      {isVoiceFlowStarted ? (
        <TarteelVoiceSearchTrigger />
      ) : (
        <>
          <DrawerSearchIcon />
          <div
            className={classNames(styles.searchInputContainer, {
              [styles.searchInputContainerRTL]: isRTLInput,
            })}
          >
            <input
              className={styles.searchInput}
              type="text"
              ref={inputRef}
              dir="auto"
              placeholder="Search"
              onChange={onSearchQueryChange}
              value={searchQuery}
              disabled={isSearching}
            />
            <TarteelVoiceSearchTrigger />
            {searchQuery && (
              <button type="button" className={styles.clear} onClick={resetQueryAndResults}>
                Clear
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Header;
