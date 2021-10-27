import React from 'react';

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
import { generateRadioItems, generateSelectOptions } from 'src/utils/input';
import { RecitersResponse } from 'types/ApiResponses';
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

const autoScrollingOptions = generateRadioItems(['On', 'Off']);

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

  return (
    <div className={styles.container}>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => (
          <Section>
            <Section.Title>{t('audio')}</Section.Title>
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
              <Section.Label>Auto Scroll</Section.Label>
              <RadioGroup
                onChange={(value) => dispatch(setEnableAutoScrolling(value === 'On'))}
                value={enableAutoScrolling ? 'On' : 'Off'}
                label="view"
                items={autoScrollingOptions}
                orientation={RadioGroupOrientation.Horizontal}
              />
            </Section.Row>
            <Section.Row>
              <Section.Label>Playback Speed</Section.Label>
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
