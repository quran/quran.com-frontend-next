import { useCallback } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';

const SEEK_DURATION = 10;
type AudioKeyBoardListenersProps = {
  togglePlaying: () => void;
  isHidden: boolean;
  seek: (seekDuration: number) => void;
};

const AudioKeyBoardListeners = ({ seek, togglePlaying, isHidden }: AudioKeyBoardListenersProps) => {
  useHotkeys('Space', togglePlaying, {
    enabled: !isHidden,
    filter: (e) => {
      e.preventDefault();
      return true;
    },
  });

  const seekForward = useCallback(() => {
    seek(SEEK_DURATION);
  }, [seek]);
  const seekBackwards = useCallback(() => {
    seek(-SEEK_DURATION);
  }, [seek]);

  useHotkeys(
    'right',
    seekForward,
    {
      enabled: !isHidden,
      filter,
    },
    [seek],
  );
  useHotkeys(
    'left',
    seekBackwards,
    {
      enabled: !isHidden,
      filter,
    },
    [seek],
  );
  return <></>;
};

const filter = (e: KeyboardEvent) => {
  e.preventDefault();
  return true;
};

export default AudioKeyBoardListeners;
