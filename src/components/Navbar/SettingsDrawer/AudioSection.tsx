/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import SelectionCard from 'src/components/dls/SelectionCard/SelectionCard';
import Toggle from 'src/components/dls/Toggle/Toggle';
import {
  setEnableAutoScrolling,
  setPlaybackRate,
  setShowTooltipWhenPlayingAudio,
  selectAudioPlayerState,
} from 'src/redux/slices/AudioPlayer/state';
import { setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import {
  selectReadingPreferences,
  setWordClickFunctionality,
} from 'src/redux/slices/QuranReader/readingPreferences';
import SliceName from 'src/redux/types/SliceName';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { formatPreferenceGroupValue } from 'src/utils/auth/preferencesMapper';
import { logValueChange } from 'src/utils/eventLogger';
import { generateSelectOptions } from 'src/utils/input';
import { toLocalizedNumber } from 'src/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { WordClickFunctionality } from 'types/QuranReader';

export const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const readingPreferences = useSelector(selectReadingPreferences);
  const { wordClickFunctionality } = readingPreferences;
  const audioPlayerState = useSelector(selectAudioPlayerState);
  const {
    playbackRate,
    showTooltipWhenPlayingAudio,
    enableAutoScrolling,
    reciter: selectedReciter,
  } = audioPlayerState;

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {string | number | boolean} value
   * @param {Action} action
   */
  const onSettingsChange = (
    key: string,
    value: string | number | boolean,
    action: Action,
    currentSliceValue = audioPlayerState,
    sliceName = SliceName.AUDIO_PLAYER_STATE,
    preferenceGroup = PreferenceGroup.AUDIO,
  ) => {
    if (isLoggedIn()) {
      addOrUpdateUserPreference(
        formatPreferenceGroupValue(sliceName, currentSliceValue, key, value),
        preferenceGroup,
      )
        .then(() => {
          dispatch(action);
        })
        .catch(() => {
          // TODO: show an error
        });
    } else {
      dispatch(action);
    }
  };

  const onPlaybackRateChanged = (value) => {
    logValueChange('audio_playback_rate', playbackRate, value);
    onSettingsChange('playbackRate', Number(value), dispatch(setPlaybackRate(Number(value))));
  };

  const playbackRatesOptions = useMemo(
    () =>
      generateSelectOptions(
        playbackRates.map((rate) => ({ label: toLocalizedNumber(rate, lang), value: rate })),
      ),
    [lang],
  );

  const onSelectionCardClicked = () => {
    dispatch(setSettingsView(SettingsView.Reciter));
    logValueChange('settings_view', SettingsView.Reciter, SettingsView.Body);
  };

  const onRepeatSettingsSelectionCardClicked = () => {
    dispatch(setSettingsView(SettingsView.RepeatSettings));
    logValueChange('settings_view', SettingsView.RepeatSettings, SettingsView.Body);
  };
  const onEnableAutoScrollingChange = () => {
    const newValue = !enableAutoScrolling;
    logValueChange('audio_settings_auto_scrolling_enabled', enableAutoScrolling, newValue);
    onSettingsChange('enableAutoScrolling', newValue, dispatch(setEnableAutoScrolling(newValue)));
  };

  const onWordClickChange = () => {
    const newValue =
      wordClickFunctionality === WordClickFunctionality.PlayAudio
        ? WordClickFunctionality.NoAudio
        : WordClickFunctionality.PlayAudio;
    logValueChange('audio_settings_word_click_functionality', wordClickFunctionality, newValue);
    onSettingsChange(
      'wordClickFunctionality',
      newValue,
      setWordClickFunctionality(newValue),
      readingPreferences,
      SliceName.READING_PREFERENCES,
      PreferenceGroup.READING,
    );
  };

  const onShowTooltipWhenPlayingAudioChange = () => {
    const newValue = !showTooltipWhenPlayingAudio;
    logValueChange(
      'audio_settings_show_tooltip_when_playing_audio',
      showTooltipWhenPlayingAudio,
      newValue,
    );
    onSettingsChange(
      'showTooltipWhenPlayingAudio',
      newValue,
      dispatch(setShowTooltipWhenPlayingAudio(newValue)),
    );
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('audio.title')}</Section.Title>
        <Section.Row>
          <SelectionCard
            label={t('settings.selected-reciter')}
            value={
              selectedReciter.translatedName
                ? selectedReciter.translatedName.name
                : selectedReciter.name
            }
            onClick={onSelectionCardClicked}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('audio.auto-scroll.title')}</Section.Label>
          <Toggle isChecked={enableAutoScrolling} onClick={onEnableAutoScrollingChange} />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('word-click.title')}</Section.Label>
          <Toggle
            isChecked={wordClickFunctionality === WordClickFunctionality.PlayAudio}
            onClick={onWordClickChange}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>
            {t('settings.show-tooltip-when-playing-audio')}
            <HelperTooltip>{t('settings.tooltip-playing-audio-helper')}</HelperTooltip>
          </Section.Label>
          <Toggle
            isChecked={showTooltipWhenPlayingAudio}
            onClick={onShowTooltipWhenPlayingAudioChange}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('audio.playback-speed')}</Section.Label>
          <Select
            id="theme-section"
            name="theme"
            options={playbackRatesOptions}
            value={playbackRate.toString()}
            onChange={onPlaybackRateChanged}
          />
        </Section.Row>
        <Section.Row>
          <SelectionCard
            value={t('audio.player.repeat-settings')}
            onClick={onRepeatSettingsSelectionCardClicked}
          />
        </Section.Row>
      </Section>
    </div>
  );
};

export default AudioSection;
