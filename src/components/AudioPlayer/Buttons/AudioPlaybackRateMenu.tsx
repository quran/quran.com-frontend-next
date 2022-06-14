import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
import { selectAudioPlayerState, setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';
import SliceName from 'src/redux/types/SliceName';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { formatPreferenceGroupValue } from 'src/utils/auth/preferencesMapper';
import { logButtonClick, logValueChange } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const AudioPlaybackRateMenu = ({ onBack }) => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const audioPlayerState = useSelector(selectAudioPlayerState);
  const { playbackRate: currentPlaybackRate } = audioPlayerState;

  const getPlaybackRateLabel = useCallback(
    (playbackRate) => {
      return playbackRate === 1
        ? t('audio.playback-normal')
        : toLocalizedNumber(playbackRate, lang);
    },
    [lang, t],
  );

  const onPlaybackRateSelected = (playbackRate: number) => {
    if (isLoggedIn()) {
      addOrUpdateUserPreference(
        formatPreferenceGroupValue(
          SliceName.AUDIO_PLAYER_STATE,
          audioPlayerState,
          'playbackRate',
          playbackRate,
        ),
        PreferenceGroup.AUDIO,
      )
        .then(() => {
          dispatch(setPlaybackRate(playbackRate));
          onBack();
        })
        .catch(() => {
          // TODO: show an error
        });
    } else {
      dispatch(setPlaybackRate(playbackRate));
      onBack();
    }
  };

  const rates = playbackRates.map((playbackRate) => (
    <PopoverMenu.Item
      key={playbackRate}
      icon={playbackRate === currentPlaybackRate ? <CheckIcon /> : <span />}
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
