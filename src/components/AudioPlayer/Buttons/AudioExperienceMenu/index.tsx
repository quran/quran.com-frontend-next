import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import styles from './AudioExperienceMenu.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import {
  setEnableAutoScrolling,
  setShowTooltipWhenPlayingAudio,
  selectAudioPlayerState,
} from '@/redux/slices/AudioPlayer/state';
import { setIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { selectShowTooltipFor } from '@/redux/slices/QuranReader/readingPreferences';
import { logValueChange, logButtonClick } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const AudioExperienceMenu = ({ onBack }) => {
  const { t } = useTranslation('common');
  const {
    // isLoading, // TODO: handle this
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();
  const dispatch = useDispatch();

  const audioPlayerState = useSelector(selectAudioPlayerState);
  const { enableAutoScrolling, showTooltipWhenPlayingAudio } = audioPlayerState;
  const showTooltipFor = useSelector(selectShowTooltipFor);

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

  const onSettingsClicked = () => {
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('experience_settings_drawer');
  };

  return (
    <>
      <PopoverMenu.Item shouldFlipOnRTL icon={<ChevronLeftIcon />} onClick={onBack}>
        {t('audio.experience')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      <div className={styles.checkboxContainer}>
        <div>
          <Checkbox
            checked={enableAutoScrolling}
            id="auto-scrolling"
            name="auto-scrolling"
            label={t('audio.auto-scroll.title')}
            onChange={onEnableAutoScrollingChange}
          />
        </div>
        <div>
          <Checkbox
            checked={showTooltipWhenPlayingAudio}
            id="show-tooltip"
            name="show-tooltip"
            label={t('settings.show-tooltip-when-playing-audio')}
            onChange={onShowTooltipWhenPlayingAudioChange}
          />
          <div className={styles.experienceTipContainer}>
            {showTooltipFor.map((tooltipTextType, index) => (
              <span key={tooltipTextType} className={styles.tooltipText}>
                {t(tooltipTextType)}
                {`${index === 0 && showTooltipFor.length > 1 ? ' • ' : ''}`}
              </span>
            ))}
            <div>
              <span>{t('audio.exp-tip')}</span>
              <br />
              <span
                onKeyPress={onSettingsClicked}
                tabIndex={0}
                role="button"
                onClick={onSettingsClicked}
                className={classNames(styles.bold, styles.link)}
              >
                {` ${t('settings.title')}`}
              </span>
              {' >'}
              <span className={styles.bold}>{` ${t('wbw')}`}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioExperienceMenu;
