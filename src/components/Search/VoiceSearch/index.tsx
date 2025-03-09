import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './VoiceSearch.module.scss';

import useVoiceSearch from '@/hooks/useVoiceSearch';
import MicIcon from '@/icons/microphone.svg';
import { selectMicrophoneActive } from '@/redux/slices/microphone';

export interface VoiceSearchHandle {
  stopMicrophone: () => void;
}

interface VoiceSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isInSearchDrawer?: boolean;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Voice search component with microphone button
 *
 * @returns {JSX.Element} The voice search button component
 */
const VoiceSearch: React.FC<VoiceSearchProps> = ({
  searchQuery,
  setSearchQuery,
  inputRef,
  isInSearchDrawer = false,
  onError,
  className,
}) => {
  // Add a custom error handler that logs and passes the error to the parent
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    }
  };

  const { isSupported, handleVoiceSearch } = useVoiceSearch({
    searchQuery,
    setSearchQuery,
    inputRef,
    isInSearchDrawer,
    onError: handleError,
  });

  // Get microphone state from Redux
  const isMicActive = useSelector(selectMicrophoneActive);

  // Don't render the button if speech recognition is not supported
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleVoiceSearch}
      className={classNames(styles.micButton, { [styles.active]: isMicActive }, className)}
      aria-label={isMicActive ? 'Stop voice search' : 'Start voice search'}
    >
      <MicIcon />
    </button>
  );
};

export default VoiceSearch;
