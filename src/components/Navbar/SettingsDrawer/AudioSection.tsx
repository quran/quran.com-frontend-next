import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import RightIcon from '../../../../public/icons/east.svg';

import styles from './AudioSection.module.scss';
import Section from './Section';

import Button from 'src/components/dls/Button/Button';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import Select from 'src/components/dls/Forms/Select';
import {
  selectEnableAutoScrolling,
  selectReciter,
  setEnableAutoScrolling,
  selectPlaybackRate,
  setPlaybackRate,
} from 'src/redux/slices/AudioPlayer/state';
import { generateSelectOptions } from 'src/utils/input';
import { AutoScroll } from 'types/QuranReader';

const AudioSection = ({ onChooseReciter }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);
  const playbackRate = useSelector(selectPlaybackRate);

  const onPlaybackRateChanged = (value) => {
    dispatch(setPlaybackRate(Number(value)));
  };

  const autoScrollingOptions = useMemo(
    () =>
      Object.values(AutoScroll).map((item) => ({
        label: t(`audio.auto-scroll.${item}`),
        id: item,
        value: item,
      })),
    [t],
  );

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('audio.title')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('audio.auto-scroll.title')}</Section.Label>
          <RadioGroup
            onChange={(value) => dispatch(setEnableAutoScrolling(value === AutoScroll.ON))}
            value={enableAutoScrolling ? AutoScroll.ON : AutoScroll.OFF}
            label="view"
            items={autoScrollingOptions}
            orientation={RadioGroupOrientation.Horizontal}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('audio.playback-speed')}</Section.Label>
          <Select
            id="theme-section"
            name="theme"
            options={playbackRates}
            value={playbackRate.toString()}
            onChange={onPlaybackRateChanged}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('reciter')}</Section.Label>
          <div>{selectedReciter.name}</div>
        </Section.Row>
        <div className={styles.chooseAudioButtonContainer}>
          <Button onClick={onChooseReciter} suffix={<RightIcon />}>
            Choose Reciter
          </Button>
        </div>
      </Section>
    </div>
  );
};

const playbackRates = generateSelectOptions([
  '0.25',
  '0.5',
  '0.75',
  '1',
  '1.25',
  '1.5',
  '1.75',
  '2',
]);

export default AudioSection;
