/* eslint-disable max-lines */
import React, { useContext, useMemo } from 'react';

import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import { useSelector as useXstateSelector } from '@xstate/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import DataFetcher from '@/components/DataFetcher';
import Select from '@/dls/Forms/Select';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Toggle from '@/dls/Toggle/Toggle';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  setEnableAutoScrolling,
  setShowTooltipWhenPlayingAudio,
  selectAudioPlayerState,
} from '@/redux/slices/AudioPlayer/state';
import { setSettingsView, SettingsView } from '@/redux/slices/navbar';
import {
  selectReadingPreferences,
  setWordClickFunctionality,
} from '@/redux/slices/QuranReader/readingPreferences';
import { makeAvailableRecitersUrl } from '@/utils/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { generateSelectOptions } from '@/utils/input';
import { toLocalizedNumber } from '@/utils/locale';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { RecitersResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { WordClickFunctionality } from 'types/QuranReader';

export const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioSection = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const dispatch = useDispatch();
  const audioService = useContext(AudioPlayerMachineContext);
  const readingPreferences = useSelector(selectReadingPreferences);
  const { wordClickFunctionality } = readingPreferences;
  const audioPlayerState = useSelector(selectAudioPlayerState);
  const { showTooltipWhenPlayingAudio, enableAutoScrolling } = audioPlayerState;
  const selectedReciterId = useXstateSelector(audioService, (state) => state.context.reciterId);

  const {
    actions: { onSettingsChange, onXstateSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const playbackRate = useXstateSelector(audioService, (state) => state.context.playbackRate);

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

  const onPlaybackRateChanged = (value) => {
    logValueChange('audio_playback_rate', playbackRate, value);
    const previousPlaybackRate = audioService.getSnapshot().context.playbackRate;
    onXstateSettingsChange(
      'playbackRate',
      value,
      () =>
        audioService.send({
          type: 'SET_PLAYBACK_SPEED',
          playbackRate: Number(value),
        }),
      () =>
        audioService.send({
          type: 'SET_PLAYBACK_SPEED',
          playbackRate: previousPlaybackRate,
        }),
      PreferenceGroup.AUDIO,
    );
  };

  const playbackRatesOptions = useMemo(
    () =>
      generateSelectOptions(
        playbackRates.map((rate) => ({ label: toLocalizedNumber(rate, locale), value: rate })),
      ),
    [locale],
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
    onAudioSettingsChange('enableAutoScrolling', newValue, setEnableAutoScrolling);
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
      setWordClickFunctionality(wordClickFunctionality),
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
    onAudioSettingsChange('showTooltipWhenPlayingAudio', newValue, setShowTooltipWhenPlayingAudio);
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title isLoading={isLoading}>{t('audio.title')}</Section.Title>
        <Section.Row>
          <DataFetcher
            queryKey={makeAvailableRecitersUrl(locale)}
            render={(data: RecitersResponse) => {
              const selectedReciter = data.reciters.find(
                (reciter) => reciter.id === selectedReciterId,
              );
              return (
                <SelectionCard
                  label={t('settings.selected-reciter')}
                  value={
                    selectedReciter.translatedName
                      ? selectedReciter.translatedName.name
                      : selectedReciter.name
                  }
                  onClick={onSelectionCardClicked}
                />
              );
            }}
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
