import { useEffect } from 'react';

import classNames from 'classnames';

import Error from './Error';
import PartialResult from './PartialResult';
import SearchResults from './SearchResults';
import styles from './VoiceSearchBodyContainer.module.scss';

import NoResults from '@/components/Search/NoResults';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useTarteelVoiceSearch from '@/hooks/useTarteelVoiceSearch';

interface Props {
  isCommandBar?: boolean;
}

const VoiceSearchBodyContainer: React.FC<Props> = ({ isCommandBar = false }) => {
  const {
    isLoading,
    partialTranscript,
    searchResult,
    error,
    volume,
    isWaitingForPermission,
    startRecording,
    stopRecording,
  } = useTarteelVoiceSearch();

  useEffect(() => {
    startRecording();

    return () => {
      stopRecording();
    };

    // we only want to start the recording once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopVoiceSearch = () => {
    // pass `false` so that we don't stop the recording and get the search results
    stopRecording(false);
  };

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
  if (searchResult && !searchResult.matches?.length) {
    return (
      <div
        className={classNames({
          [styles.container]: !isCommandBar,
          [styles.noResultContainer]: isCommandBar,
        })}
      >
        <NoResults searchQuery={partialTranscript} />
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
            stopRecording={stopVoiceSearch}
          />
        </div>
      )}
    </>
  );
};

export default VoiceSearchBodyContainer;
