import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import Select from 'src/components/dls/Forms/Select';
import { ReadingPreference, WordByWordType } from 'src/components/QuranReader/types';
import {
  selectReadingPreference,
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setShowTooltipFor,
  selectShowTooltipFor,
  selectWordByWordByWordPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { areArraysEqual } from 'src/utils/array';
import { generateRadioItems, generateSelectOptions } from 'src/utils/input';

const ReadingExperienceSection = () => {
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const showTooltipFor = useSelector(selectShowTooltipFor, areArraysEqual);

  const wordByWordValue = getWordByWordValue(
    showWordByWordTranslation,
    showWordByWordTransliteration,
  );
  const tooltipWordByWordValue = getTooltipWordByWordValue(showTooltipFor);

  // dispatch the action to word by word state
  // if the value is 'both' set word by word translation and transliteration to true
  // if the value is 'translation' set word by word translation to true
  // if the value is 'transliteration' set word by word transliteration to true
  const onWordByWordChange = (value: WordByWordValue) => {
    const wordBywordTranslation = value === BOTH || value === WordByWordType.Translation;
    const wordByWordTransliteration = value === BOTH || value === WordByWordType.Transliteration;
    dispatch(setShowWordByWordTranslation(wordBywordTranslation));
    dispatch(setShowWordByWordTransliteration(wordByWordTransliteration));
  };

  /**
   * Dispatch the value to the redux state based on item selected:
   *
   * 1. if it's NONE we dispatch with an empty array.
   * 2. if it's BOTH we dispatch with an array containing both options.
   * 3. if it's one of the two options, we put it in an array and dispatch with that array.
   *
   * @param {WordByWordValue | ''} value the selected value which can be empty string if if the user un-selects the current item.
   */
  const onTooltipWordByWordChange = (value: WordByWordValue | '') => {
    if (!value || value === NONE) {
      dispatch(setShowTooltipFor([]));
    } else if (value === BOTH) {
      dispatch(setShowTooltipFor([WordByWordType.Transliteration, WordByWordType.Translation]));
    } else {
      dispatch(setShowTooltipFor([value] as WordByWordType[]));
    }
  };

  return (
    <Section>
      <Section.Title>Reading Experience</Section.Title>
      <Section.Row>
        <Section.Label>View</Section.Label>
        <RadioGroup
          onChange={(value) => dispatch(setReadingPreference(value as ReadingPreference))}
          value={readingPreference}
          label="view"
          items={preferences}
          orientation={RadioGroupOrientation.Horizontal}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>Word By Word</Section.Label>
        <Select
          id="wordByWord"
          name="wordByWord"
          options={wordByWordOptions}
          value={wordByWordValue}
          onChange={onWordByWordChange}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>Tooltip</Section.Label>
        <Select
          id="showToolTipFor"
          name="showToolTipFor"
          options={wordByWordOptions}
          value={tooltipWordByWordValue}
          onChange={onTooltipWordByWordChange}
        />
      </Section.Row>
    </Section>
  );
};

const NONE = 'none';
const BOTH = 'both';

// TODO: internationalize labels
const preferences = generateRadioItems([ReadingPreference.Reading, ReadingPreference.Translation]);

// wordByWordOptions will be used as items in select component
// TODO: internationalize labels
const wordByWordOptions = generateSelectOptions([
  NONE,
  WordByWordType.Translation,
  WordByWordType.Transliteration,
  BOTH,
]);

type WordByWordValue = typeof BOTH | typeof NONE | WordByWordType;

// get the value from the redux store for translation and transliteration
// and returns
// 'both' if both are true,
// 'translation' if only translation is true,
// 'transliteration' if only transliteration is true,
// 'none' if neither are true
const getWordByWordValue = (
  showWordByWordTranslation: boolean,
  showWordByWordTransliteration: boolean,
): WordByWordValue => {
  if (showWordByWordTranslation && showWordByWordTransliteration) {
    return BOTH;
  }
  if (showWordByWordTranslation) {
    return WordByWordType.Translation;
  }
  if (showWordByWordTransliteration) {
    return WordByWordType.Transliteration;
  }
  return NONE;
};

/**
 * This is used to detect which type we should show based on the
 * value stored in redux.
 *
 * @param {WordByWordType[]} showTooltipFor
 * @returns {WordByWordValue}
 */
const getTooltipWordByWordValue = (showTooltipFor: WordByWordType[]): WordByWordValue =>
  getWordByWordValue(
    showTooltipFor && showTooltipFor.includes(WordByWordType.Translation),
    showTooltipFor && showTooltipFor.includes(WordByWordType.Transliteration),
  );

export default ReadingExperienceSection;
