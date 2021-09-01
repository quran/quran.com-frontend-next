import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Counter from 'src/components/dls/Counter/Counter';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { QuranFont } from 'src/components/QuranReader/types';
// import VerseText from 'src/components/Verse/VerseText';
import {
  decreaseQuranTextFontScale,
  increaseQuranTextFontScale,
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
  setQuranFont,
  initialState as QuranReaderStylesInitialState,
} from 'src/redux/slices/QuranReader/styles';
// import { getSampleVerse } from 'src/utils/verse';
// import Word from 'types/Word';
// import styles from './QuranFontSection.module.scss';

import Section from './Section';

// in the UI, we have two view / font categories, indopak and uthmani.
const type = [
  { id: QuranFont.IndoPak, label: 'IndoPak', value: QuranFont.IndoPak, name: QuranFont.IndoPak },
  { id: QuranFont.Uthmani, label: 'Uthmani', value: QuranFont.Uthmani, name: QuranFont.Uthmani },
];

// when one of the view is selected, user can choose which font they want to use
const fonts = {
  [QuranFont.IndoPak]: [{ id: QuranFont.IndoPak, label: 'IndoPak', value: QuranFont.IndoPak }],
  [QuranFont.Uthmani]: [
    {
      id: QuranFont.QPCHafs,
      label: 'QPC Uthmani Hafs',
      value: QuranFont.QPCHafs,
      name: QuranFont.QPCHafs,
    },
    {
      id: QuranFont.MadaniV1,
      label: 'King Fahad Complex V1',
      value: QuranFont.MadaniV1,
      name: QuranFont.MadaniV1,
    },
    {
      id: QuranFont.MadaniV2,
      label: 'King Fahad Complex V2',
      value: QuranFont.MadaniV2,
      name: QuranFont.MadaniV2,
    },
  ],
};

// given quranFont [all quran fonts variants], check whether it belongs to IndoPak or Uthmani
// for example if it's QuranFont.MadaniV1, it belongs to QuranFont.Uthmani
// if it's QuranFont.IndoPak, it belongs to QuranFont.IndoPak
const getSelectedType = (font: QuranFont) => {
  const selectedViewEntry = Object.entries(fonts).find(([, values]) =>
    values.some((v) => v.id === font),
  );
  if (selectedViewEntry) {
    const view = selectedViewEntry[0];
    return view;
  }
  // if no font is given, or invalid font is given, get type for default font
  return getSelectedType(QuranReaderStylesInitialState.quranFont);
};

// get the label for selected font. For example for QuranFont.MadaniV1, it will be 'King Fahad Complex V1'
const getLabel = (font: QuranFont, selectedType) =>
  fonts[selectedType].find((v) => v.id === font)?.label;

// get default font for selected type. We take the first font in this case
// for example for QurantFont.Uthmani, it will be QuranFont.QPCHafs
const getDefaultFont = (selectedType) => {
  const font = fonts[selectedType][0];
  return font.value;
};

const QuranFontSection = () => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { quranFont, quranTextFontScale } = quranReaderStyles;
  const selectedType = getSelectedType(quranFont);

  return (
    <Section>
      <Section.Title>Quran Font</Section.Title>
      <Section.Row>
        <Section.Label>Type</Section.Label>
        <RadioGroup
          onChange={(value) => dispatch(setQuranFont(getDefaultFont(value)))}
          value={selectedType}
          label="type"
          items={type}
          orientation={RadioGroupOrientation.Horizontal}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>Style</Section.Label>
        <div>
          <Combobox
            id="quran-font-styles"
            value={quranFont}
            initialInputValue={getLabel(quranFont, selectedType)}
            items={fonts[selectedType]}
            onChange={(value) => dispatch(setQuranFont(value as QuranFont))}
          />
        </div>
      </Section.Row>
      <Section.Row>
        <Section.Label>Font size</Section.Label>
        <Counter
          count={quranTextFontScale}
          onDecrement={
            quranTextFontScale === MINIMUM_FONT_STEP
              ? null
              : () => dispatch(decreaseQuranTextFontScale())
          }
          onIncrement={
            quranTextFontScale === MAXIMUM_FONT_STEP
              ? null
              : () => dispatch(increaseQuranTextFontScale())
          }
        />
      </Section.Row>
      {/* <div className={styles.verseSampleContainer}>
        <VerseText words={getSampleVerse().words as Word[]} />
      </div> */}
      <Section.Footer
        visible={quranFont === QuranFont.MadaniV1 || quranFont === QuranFont.MadaniV2}
      >
        KPFG Fonts provide higher quality but take longer to load and cannot be copied through the
        browser.
      </Section.Footer>
    </Section>
  );
};

export default QuranFontSection;
