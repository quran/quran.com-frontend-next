import { useCallback, useContext } from 'react';

import { useHotkeys, Options } from 'react-hotkeys-hook';

import { logEvent } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

type AudioKeyBoardListenersProps = {
  togglePlaying: () => void;
  isAudioPlayerHidden: boolean;
};

const AudioKeyBoardListeners = ({
  togglePlaying,
  isAudioPlayerHidden,
}: AudioKeyBoardListenersProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const toggleAudioPlayer = useCallback(
    (event: KeyboardEvent) => {
      logEvent('audio_player_toggle_keyboard_shortcut');
      event.preventDefault();
      togglePlaying();
    },
    [togglePlaying],
  );
  const seekForward = (event: KeyboardEvent) => {
    logEvent('audio_player_fwd_keyboard_shortcut');
    event.preventDefault();
    audioService.send({ type: 'NEXT_AYAH' });
  };
  const seekBackwards = (event: KeyboardEvent) => {
    logEvent('audio_player_bwd_keyboard_shortcut');
    event.preventDefault();
    audioService.send({ type: 'PREV_AYAH' });
  };

  const options = { enabled: !isAudioPlayerHidden } as Options;
  useHotkeys('space', toggleAudioPlayer, options, [togglePlaying]);
  useHotkeys('right', seekForward, options);
  useHotkeys('left', seekBackwards, options);
  return <></>;
};

export default AudioKeyBoardListeners;
