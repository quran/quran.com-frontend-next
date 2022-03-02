import React from 'react';

import classNames from 'classnames';

import Error from './Error';
import PartialResult from './PartialResult';
import SearchResults from './SearchResults';
import styles from './VoiceSearchBodyContainer.module.scss';

import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import NoResults from 'src/components/Search/NoResults';
import useTarteelVoiceSearch from 'src/hooks/useTarteelVoiceSearch';

interface Props {
  isCommandBar?: boolean;
}

const VoiceSearchBodyContainer: React.FC<Props> = ({ isCommandBar = false }) => {
  const { isLoading, partialTranscript, searchResult, error, volume, isWaitingForPermission } =
    useTarteelVoiceSearch();

  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }
  // if there is an error or we are waiting for the permission from the user
  if (error || isWaitingForPermission) {
    return (
      <div
        className={classNames({
          [styles.container]: !isCommandBar,
        })}
      >
        <Error
          isCommandBar={isCommandBar}
          error={error}
          isWaitingForPermission={isWaitingForPermission}
        />
      </div>
    );
  }

  // if we received the result but no matches
  if (searchResult && !searchResult.matches.length) {
    return (
      <div
        className={classNames({
          [styles.container]: !isCommandBar,
          [styles.noResultContainer]: isCommandBar,
        })}
      >
        <NoResults searchQuery={partialTranscript} isSearchDrawer={false} />
      </div>
    );
  }

  return (
    <>
      {searchResult ? (
        <SearchResults searchResult={searchResult} isCommandBar={isCommandBar} />
      ) : (
        <div
          className={classNames({
            [styles.container]: !isCommandBar,
            [styles.commandBarContainer]: isCommandBar,
          })}
        >
          <PartialResult
            verticalLayout={!isCommandBar}
            partialTranscript={partialTranscript}
            volume={volume}
          />
        </div>
      )}
    </>
  );
};

export default VoiceSearchBodyContainer;
