import { useCallback, useEffect } from 'react';

const SEEK_DURATION = 5;
type AudioKeyBoardListenersProps = {
  togglePlaying: () => void;
  seek: (seekDuration: number, absoluteTime?: boolean) => void;
  disabled: boolean;
};

const AudioKeyBoardListeners = ({ seek, togglePlaying, disabled }: AudioKeyBoardListenersProps) => {
  const spaceKeyHandler = useCallback(
    (event) => {
      if (event.code === 'Space') {
        togglePlaying();
        event.preventDefault();
      }
    },
    [togglePlaying],
  );

  const arrowKeyHandler = useCallback(
    (event) => {
      if (event.code === 'ArrowRight') {
        seek(SEEK_DURATION);
        event.preventDefault();
      } else if (event.code === 'ArrowLeft') {
        seek(-SEEK_DURATION);
        event.preventDefault();
      }
    },
    [seek],
  );

  useEffect(() => {
    if (!disabled) {
      window.addEventListener('keypress', spaceKeyHandler);
      window.addEventListener('keydown', arrowKeyHandler);
    }
    return () => {
      window.removeEventListener('keypress', spaceKeyHandler);
      window.removeEventListener('keydown', arrowKeyHandler);
    };
  }, [spaceKeyHandler, arrowKeyHandler, disabled]);
  return <></>;
};

export default AudioKeyBoardListeners;
