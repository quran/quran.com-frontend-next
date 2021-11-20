import { useCallback } from 'react';

import { useHotkeys, Options } from 'react-hotkeys-hook';

const SEEK_DURATION = 10;
type AudioKeyBoardListenersProps = {
  togglePlaying: () => void;
  isAudioPlayerHidden: boolean;
  seek: (seekDuration: number) => void;
};

const AudioKeyBoardListeners = ({
  seek,
  togglePlaying,
  isAudioPlayerHidden,
}: AudioKeyBoardListenersProps) => {
  const toggleAudioPlayer = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      togglePlaying();
    },
    [togglePlaying],
  );
  const seekForward = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      seek(SEEK_DURATION);
    },
    [seek],
  );
  const seekBackwards = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      seek(-SEEK_DURATION);
    },
    [seek],
  );

  const options = { enabled: !isAudioPlayerHidden } as Options;
  useHotkeys('space', toggleAudioPlayer, options, [togglePlaying]);
  useHotkeys('right', seekForward, options, [seek]);
  useHotkeys('left', seekBackwards, options, [seek]);
  return <></>;
};

export default AudioKeyBoardListeners;
