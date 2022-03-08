import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { CheckIcon, ChevronLeftIcon } from 'src/components/Icons';
import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
import { selectPlaybackRate, setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick, logValueChange } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';

const AudioPlaybackRateMenu = ({ onBack }) => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const currentPlaybackRate = useSelector(selectPlaybackRate);

  const getPlaybackRateLabel = useCallback(
    (playbackRate) => {
      return playbackRate === 1
        ? t('audio.playback-normal')
        : toLocalizedNumber(playbackRate, lang);
    },
    [lang, t],
  );

  const rates = playbackRates.map((playbackRate) => (
    <PopoverMenu.Item
      key={playbackRate}
      icon={playbackRate === currentPlaybackRate ? <CheckIcon /> : <span />}
      onClick={() => {
        logButtonClick('audio_player_menu_playback_item');
        logValueChange('audio_playback_rate', currentPlaybackRate, playbackRate);
        dispatch(setPlaybackRate(playbackRate));
        onBack();
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
