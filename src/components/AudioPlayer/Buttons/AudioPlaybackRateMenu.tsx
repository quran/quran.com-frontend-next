import { useCallback, useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CheckIcon from '@/icons/check.svg';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioPlaybackRateMenu = ({ onBack }) => {
  const { t, lang } = useTranslation('common');
  const {
    actions: { onXstateSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const audioService = useContext(AudioPlayerMachineContext);
  const currentPlaybackRate = useSelector(audioService, (state) => state.context.playbackRate);

  const getPlaybackRateLabel = useCallback(
    (playbackRate) => {
      return playbackRate === 1
        ? t('audio.playback-normal')
        : toLocalizedNumber(playbackRate, lang);
    },
    [lang, t],
  );

  const onPlaybackRateSelected = (playbackRate: number) => {
    const previousPlaybackRate = currentPlaybackRate;

    onXstateSettingsChange(
      'playbackRate',
      playbackRate,
      () =>
        audioService.send({
          type: 'SET_PLAYBACK_SPEED',
          playbackRate,
        }),
      () =>
        audioService.send({
          type: 'SET_PLAYBACK_SPEED',
          playbackRate: previousPlaybackRate,
        }),
      PreferenceGroup.AUDIO,
      onBack,
    );
  };

  const getItemIcon = (playbackRate: number) => {
    if (currentPlaybackRate === playbackRate) {
      if (isLoading) {
        return <Spinner />;
      }
      return <CheckIcon />;
    }
    return <span />;
  };

  const rates = playbackRates.map((playbackRate) => (
    <PopoverMenu.Item
      key={playbackRate}
      icon={getItemIcon(playbackRate)}
      onClick={() => {
        logButtonClick('audio_player_menu_playback_item');
        logValueChange('audio_playback_rate', currentPlaybackRate, playbackRate);
        onPlaybackRateSelected(playbackRate);
      }}
    >
      {getPlaybackRateLabel(playbackRate)}
    </PopoverMenu.Item>
  ));
  return (
    <>
      <PopoverMenu.Item shouldFlipOnRTL icon={<ChevronLeftIcon />} onClick={onBack}>
        {t('audio.playback-speed')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {rates}
    </>
  );
};

export default AudioPlaybackRateMenu;
