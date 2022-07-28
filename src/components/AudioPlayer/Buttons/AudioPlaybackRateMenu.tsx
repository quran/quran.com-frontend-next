import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
import usePersistPreferenceGroup from 'src/hooks/auth/usePersistPreferenceGroup';
import { selectAudioPlayerState, setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick, logValueChange } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const AudioPlaybackRateMenu = ({ onBack }) => {
  const { t, lang } = useTranslation('common');
  const audioPlayerState = useSelector(selectAudioPlayerState);
  const { playbackRate: currentPlaybackRate } = audioPlayerState;
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const getPlaybackRateLabel = useCallback(
    (playbackRate) => {
      return playbackRate === 1
        ? t('audio.playback-normal')
        : toLocalizedNumber(playbackRate, lang);
    },
    [lang, t],
  );

  const onPlaybackRateSelected = (playbackRate: number) => {
    onSettingsChange(
      'playbackRate',
      playbackRate,
      setPlaybackRate(playbackRate),
      setPlaybackRate(audioPlayerState.playbackRate),
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
