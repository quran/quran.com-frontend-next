import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import SelectionCard from 'src/components/dls/SelectionCard/SelectionCard';
import Toggle from 'src/components/dls/Toggle/Toggle';
import {
  selectEnableAutoScrolling,
  selectReciter,
  setEnableAutoScrolling,
  selectPlaybackRate,
  setPlaybackRate,
} from 'src/redux/slices/AudioPlayer/state';
import { setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import {
  selectWordClickFunctionality,
  setWordClickFunctionality,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from 'src/utils/eventLogger';
import { generateSelectOptions } from 'src/utils/input';
import { toLocalizedNumber } from 'src/utils/locale';
import { WordClickFunctionality } from 'types/QuranReader';

export const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);
  const playbackRate = useSelector(selectPlaybackRate);
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);

  const onPlaybackRateChanged = (value) => {
    logValueChange('audio_playback_rate', playbackRate, value);
    dispatch(setPlaybackRate(Number(value)));
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
    dispatch(setEnableAutoScrolling(newValue));
  };

  const onWordClickChange = () => {
    const newValue =
      wordClickFunctionality === WordClickFunctionality.PlayAudio
        ? WordClickFunctionality.NoAudio
        : WordClickFunctionality.PlayAudio;
    logValueChange('audio_settings_word_click_functionality', wordClickFunctionality, newValue);
    dispatch(setWordClickFunctionality(newValue));
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('audio.title')}</Section.Title>
        <Section.Row>
          <SelectionCard
            label={t('settings.selected-reciter')}
            value={selectedReciter.name}
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
