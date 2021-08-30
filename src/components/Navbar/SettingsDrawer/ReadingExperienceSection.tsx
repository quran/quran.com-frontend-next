import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { ReadingPreference } from 'src/components/QuranReader/types';
import {
  selectReadingPreference,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { Section, SectionDescription, SectionLabel, SectionRow, SectionTitle } from './Section';

// TODO: internationalize labels
const preferences = [
  {
    id: ReadingPreference.Reading,
    label: 'Reading',
    value: ReadingPreference.Reading,
  },
  {
    id: ReadingPreference.Translation,
    label: 'Translation',
    value: ReadingPreference.Translation,
  },
];

const ReadingExperienceSection = () => {
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);
  console.log(readingPreference);

  return (
    <Section>
      <SectionTitle>Reading Experience</SectionTitle>
      <SectionRow>
        <SectionLabel>Mode</SectionLabel>
        <div style={{ width: '100%' }}>
          <RadioGroup
            onChange={(value) =>
              dispatch(setReadingPreference(value as unknown as ReadingPreference))
            }
            value={readingPreference}
            label="Mode"
            items={preferences}
            orientation={RadioGroupOrientation.Horizontal}
          />
        </div>
      </SectionRow>
      <SectionDescription>
        The system theme automatically adopts to your light/dark mode settings
      </SectionDescription>
    </Section>
  );
};

export default ReadingExperienceSection;
