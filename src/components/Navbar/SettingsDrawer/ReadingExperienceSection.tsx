import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { ReadingPreference } from 'src/components/QuranReader/types';
import {
  selectReadingPreference,
  selectReadingPreferences,
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
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

const wordByWordOptions = [
  {
    id: 'none',
    value: 'none',
    name: 'none',
    label: 'None',
  },
  {
    id: 'translation',
    value: 'translation',
    name: 'translation',
    label: 'Translation',
  },
  {
    id: 'transliteration',
    value: 'transliteration',
    name: 'transliteration',
    label: 'Transliteration',
  },
  {
    id: 'both',
    value: 'both',
    name: 'both',
    label: 'Both',
  },
];

const useWordByWordValue = () => {
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectReadingPreferences,
    shallowEqual,
  );
  if (showWordByWordTranslation && showWordByWordTransliteration) {
    return 'both';
  }
  if (showWordByWordTranslation) {
    return 'translation';
  }
  if (showWordByWordTransliteration) {
    return 'transliteration';
  }
  return 'none';
};

const ReadingExperienceSection = () => {
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);

  const wordByWordValue = useWordByWordValue();
  const onWordByWordChange = (value: string) => {
    const showWordByWordTranslation = value === 'both' || value === 'translation';
    const showWordByWordTransliteration = value === 'both' || value === 'transliteration';
    dispatch(setShowWordByWordTranslation(showWordByWordTranslation));
    dispatch(setShowWordByWordTransliteration(showWordByWordTransliteration));
  };

  return (
    <Section>
      <SectionTitle>Reading Experience</SectionTitle>
      <SectionRow>
        <SectionLabel>Mode</SectionLabel>
        <RadioGroup
          onChange={(value) =>
            dispatch(setReadingPreference(value as unknown as ReadingPreference))
          }
          value={readingPreference}
          label="Mode"
          items={preferences}
          orientation={RadioGroupOrientation.Horizontal}
        />
      </SectionRow>
      <SectionRow>
        <SectionLabel>Word By Word</SectionLabel>
        <Combobox
          id="wordByWord"
          items={wordByWordOptions}
          initialInputValue={wordByWordValue}
          value={wordByWordValue}
          onChange={onWordByWordChange}
        />
      </SectionRow>
    </Section>
  );
};

export default ReadingExperienceSection;
