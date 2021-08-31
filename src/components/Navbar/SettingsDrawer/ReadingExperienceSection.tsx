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

// wordByWordOptions will be used as items in Combobox component
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

type WordByWordValue = 'both' | 'translation' | 'transliteration' | 'none';

// get the value from the redux store for translation and transliteration
// and returns
// 'both' if both are true,
// 'translation' if only translation is true,
// 'transliteration' if only transliteration is true,
// 'none' if neither are true
const useWordByWordValue = (): WordByWordValue => {
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

  const wordByWordValue: WordByWordValue = useWordByWordValue(); // 'both' | 'translation' | 'transliteration', or 'none'

  // dispatch the action to word by word state
  // if the value is 'both' set word by word translation and transliteration to true
  // if the value is 'translation' set word by word translation to true
  // if the value is 'transliteration' set word by word transliteration to true
  const onWordByWordChange = (value: WordByWordValue) => {
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
