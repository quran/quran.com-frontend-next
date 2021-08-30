import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { ReadingPreference } from 'src/components/QuranReader/types';
import {
  selectReadingPreference,
  setReadingPreference,
} from 'src/redux/slices/QuranReader/readingPreferences';

import { Section, SectionLabel, SectionRow, SectionTitle } from './Section';

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

  return (
    <Section>
      <SectionTitle>Reading Experience</SectionTitle>
      <SectionRow>
        <SectionLabel>Mode</SectionLabel>
        <div>
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
    </Section>
  );
};

export default ReadingExperienceSection;
