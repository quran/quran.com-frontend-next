import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import DataFetcher from 'src/components/DataFetcher';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import Select from 'src/components/dls/Forms/Select';
import {
  selectEnableAutoScrolling,
  selectReciter,
  setEnableAutoScrolling,
  setReciterAndPauseAudio,
  selectPlaybackRate,
  setPlaybackRate,
} from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { generateSelectOptions } from 'src/utils/input';
import { RecitersResponse } from 'types/ApiResponses';
import { AutoScroll } from 'types/QuranReader';
import Reciter from 'types/Reciter';

// convert the reciter's data from API to combobox items
// so we can use it with Combobox component
const recitersToComboboxItems = (reciters: Reciter[]) =>
  reciters
    .sort((a, b) => a.translatedName.name.localeCompare(b.translatedName.name))
    .map((item) => ({
      id: item.id.toString(),
      value: item.id.toString(),
      label: item.translatedName.name,
      name: item.id.toString(),
    }));

const AudioSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);
  const playbackRate = useSelector(selectPlaybackRate);

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciterAndPauseAudio(reciter));
  };

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
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => (
          <Section>
            <Section.Title>{t('audio.title')}</Section.Title>
            <Section.Row>
              <Section.Label>{t('reciter')}</Section.Label>
              <div>
                <Combobox
                  id="audio-reciter"
                  minimumRequiredItems={1}
                  items={data ? recitersToComboboxItems(data.reciters) : []}
                  initialInputValue={selectedReciter.name}
                  value={selectedReciter.id.toString()}
                  onChange={(reciterId: string) => {
                    onSelectedReciterChange(reciterId, data.reciters);
                  }}
                />
              </div>
            </Section.Row>
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
          </Section>
        )}
      />
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
