import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './AudioSection.module.scss';
import Section from './Section';

import DataFetcher from 'src/components/DataFetcher';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import {
  selectEnableAutoScrolling,
  selectReciter,
  setEnableAutoScrolling,
  setReciterAndPauseAudio,
} from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { generateRadioItems } from 'src/utils/input';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

// convert the reciter's data from API to combobox items
// so we can use it with Combobox component
const recitersToComboboxItems = (reciters) =>
  reciters.map((item: Reciter) => ({
    id: item.id.toString(),
    value: item.id,
    label: item.name.toString(),
    name: item.id.toString(),
  }));

const autoScrollingOptions = generateRadioItems(['On', 'Off']);

const AudioSection = () => {
  const dispatch = useDispatch();
  const selectedReciter = useSelector(selectReciter, shallowEqual);
  const isAutoScrolling = useSelector(selectEnableAutoScrolling);

  // given the reciterId, get the full reciter object.
  // and setReciter in redux
  const onSelectedReciterChange = (reciterId: string, reciters: Reciter[]) => {
    if (!reciterId) return;
    const reciter = reciters.find((r) => r.id === Number(reciterId));
    dispatch(setReciterAndPauseAudio(reciter));
  };

  return (
    <div className={styles.container}>
      <DataFetcher
        queryKey={makeRecitersUrl()}
        render={(data: RecitersResponse) => (
          <Section>
            <Section.Title>Audio</Section.Title>
            <Section.Row>
              <Section.Label>Reciter</Section.Label>
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
                value={isAutoScrolling ? 'On' : 'Off'}
                label="view"
                items={autoScrollingOptions}
                orientation={RadioGroupOrientation.Horizontal}
              />
            </Section.Row>
          </Section>
        )}
      />
    </div>
  );
};

export default AudioSection;
