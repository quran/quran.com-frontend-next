import React from 'react';

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
import { generateSelectOptions } from 'src/utils/input';
import { WordClickFunctionality } from 'types/QuranReader';

const AudioSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);
  const playbackRate = useSelector(selectPlaybackRate);
  const wordClickFunctionality = useSelector(selectWordClickFunctionality);

  const onPlaybackRateChanged = (value) => {
    dispatch(setPlaybackRate(Number(value)));
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('audio.title')}</Section.Title>
        <Section.Row>
          <SelectionCard
            label={t('settings.selected-reciter')}
            value={selectedReciter.name}
            onClick={() => dispatch(setSettingsView(SettingsView.Reciter))}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('audio.auto-scroll.title')}</Section.Label>
          <Toggle
            isChecked={enableAutoScrolling}
            onClick={() => {
              dispatch(setEnableAutoScrolling(!enableAutoScrolling));
            }}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('word-click.title')}</Section.Label>
          <Toggle
            isChecked={wordClickFunctionality === WordClickFunctionality.PlayAudio}
            onClick={() => {
              dispatch(
                setWordClickFunctionality(
                  wordClickFunctionality === WordClickFunctionality.PlayAudio
                    ? WordClickFunctionality.NoAudio
                    : WordClickFunctionality.PlayAudio,
                ),
              );
            }}
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
      </Section>
    </div>
  );
};

export const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const playbackRatesOptions = generateSelectOptions(
  playbackRates.map((playbackRate) => playbackRate.toString()),
);

export default AudioSection;
