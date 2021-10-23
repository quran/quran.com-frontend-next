import React from 'react';

import classNames from 'classnames';

import Error from './Error';
import PartialResult from './PartialResult';
import SearchResults from './SearchResults';
import styles from './VoiceSearchBodyContainer.module.scss';

import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import useTarteelVoiceSearch from 'src/hooks/useTarteelVoiceSearch';

interface Props {
  isCommandBar?: boolean;
}

const VoiceSearchBodyContainer: React.FC<Props> = ({ isCommandBar = false }) => {
  const { isLoading, partialTranscriptText, searchResult, error, volume, isWaitingForPermission } =
    useTarteelVoiceSearch();

  if (isLoading) {
    return <Spinner size={SpinnerSize.Large} />;
  }
  if (error || isWaitingForPermission) {
    return (
      <div
        className={classNames({
          [styles.container]: !isCommandBar,
          [styles.commandBarContainer]: isCommandBar,
        })}
      >
        <Error error={error} isWaitingForPermission={isWaitingForPermission} />
      </div>
    );
  }

  return (
    <>
      {searchResult ? (
        <SearchResults searchResult={searchResult} />
      ) : (
        <div
          className={classNames({
            [styles.container]: !isCommandBar,
            [styles.commandBarContainer]: isCommandBar,
          })}
        >
          <PartialResult partialTranscriptText={partialTranscriptText} volume={volume} />
        </div>
      )}
    </>
  );
};

export default VoiceSearchBodyContainer;
