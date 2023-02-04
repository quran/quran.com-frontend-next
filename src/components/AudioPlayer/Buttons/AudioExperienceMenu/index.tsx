import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './AudioExperienceMenu.module.scss';
import HelpText from './HelpText';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import {
  setEnableAutoScrolling,
  setShowTooltipWhenPlayingAudio,
  selectAudioPlayerState,
} from '@/redux/slices/AudioPlayer/state';
import { selectTooltipContentType } from '@/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const AudioExperienceMenu = ({ onBack }) => {
  const { t } = useTranslation('common');
  const {
    isLoading,
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const audioPlayerState = useSelector(selectAudioPlayerState);
  const { enableAutoScrolling, showTooltipWhenPlayingAudio } = audioPlayerState;
  const showTooltipFor = useSelector(selectTooltipContentType);

  const onAudioSettingsChange = (
    key: string,
    value: number | boolean,
    actionCreator: ActionCreatorWithOptionalPayload<number | boolean>,
  ) => {
    onSettingsChange(
      key,
      value,
      actionCreator(value),
      actionCreator(audioPlayerState[key]),
      PreferenceGroup.AUDIO,
    );
  };

  const onEnableAutoScrollingChange = (newValue: boolean) => {
    logValueChange('audio_settings_auto_scrolling_enabled', !newValue, newValue);
    onAudioSettingsChange('enableAutoScrolling', newValue, setEnableAutoScrolling);
  };

  const onShowTooltipWhenPlayingAudioChange = (newValue: boolean) => {
    logValueChange('audio_settings_show_tooltip_when_playing_audio', !newValue, newValue);
    onAudioSettingsChange('showTooltipWhenPlayingAudio', newValue, setShowTooltipWhenPlayingAudio);
  };

  return (
    <>
      <PopoverMenu.Item shouldFlipOnRTL icon={<ChevronLeftIcon />} onClick={onBack}>
        {t('audio.experience')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {isLoading && <Spinner />}
      <div className={styles.checkboxContainer}>
        <div>
          <Checkbox
            checked={enableAutoScrolling}
            id="auto-scrolling"
            name="auto-scrolling"
            label={t('audio.auto-scroll.title')}
            onChange={onEnableAutoScrollingChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <Checkbox
            checked={showTooltipWhenPlayingAudio}
            id="show-tooltip"
            name="show-tooltip"
            label={t('settings.show-tooltip-when-playing-audio')}
            onChange={onShowTooltipWhenPlayingAudioChange}
            disabled={isLoading || (showTooltipFor && showTooltipFor.length === 0)}
          />
          <div className={classNames(styles.experienceTipContainer, styles.helpText)}>
            <HelpText showTooltipFor={showTooltipFor} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioExperienceMenu;
