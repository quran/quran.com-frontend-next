import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Combobox from 'src/components/dls/Forms/Combobox';
import capitalize from 'lodash/capitalize';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { ReadingPreference, WordByWordType } from 'src/components/QuranReader/types';
import {
  selectReadingPreference,
  selectReadingPreferences,
  setReadingPreference,
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setShowTooltipFor,
} from 'src/redux/slices/QuranReader/readingPreferences';
import Section from './Section';

const ReadingExperienceSection = () => {
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);
  const { showWordByWordTranslation, showWordByWordTransliteration, showTooltipFor } = useSelector(
    selectReadingPreferences,
    shallowEqual,
  );

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
          onChange={(value) =>
            dispatch(setReadingPreference(value as unknown as ReadingPreference))
          }
          value={readingPreference}
          label="view"
          items={preferences}
          orientation={RadioGroupOrientation.Horizontal}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>Word By Word</Section.Label>
        <div>
          <Combobox
            id="wordByWord"
            items={wordByWordOptions}
            initialInputValue={getLabelById(wordByWordValue)}
            value={wordByWordValue}
            onChange={onWordByWordChange}
          />
        </div>
      </Section.Row>
      <Section.Row>
        <Section.Label>Show Tooltip For</Section.Label>
        <div>
          <Combobox
            id="showToolTipFor"
            items={wordByWordOptions}
            initialInputValue={getLabelById(tooltipWordByWordValue)}
            value={tooltipWordByWordValue}
            onChange={onTooltipWordByWordChange}
          />
        </div>
      </Section.Row>
    </Section>
  );
};

const NONE = 'none';
const BOTH = 'both';

const generateItems = (items: string[], isCombobox = true) =>
  items.map((item) => ({
    id: item,
    value: item,
    label: capitalize(item),
    ...(isCombobox && { name: item }),
  }));

// TODO: internationalize labels
const preferences = generateItems(
  [ReadingPreference.Reading, ReadingPreference.Translation],
  false,
);
// wordByWordOptions will be used as items in Combobox component
const wordByWordOptions = generateItems([
  NONE,
  WordByWordType.Translation,
  WordByWordType.Transliteration,
  BOTH,
]);

/**
 * Get the label of the combobox based on the id.
 *
 * @param {string} id
 * @returns {string}
 */
const getLabelById = (id: string): string =>
  wordByWordOptions.find((option) => option.id === id)?.label;

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
    showTooltipFor.includes(WordByWordType.Translation),
    showTooltipFor.includes(WordByWordType.Transliteration),
  );

export default ReadingExperienceSection;
