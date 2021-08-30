import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Combobox from 'src/components/dls/Forms/Combobox';
import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { QuranFont } from 'src/components/QuranReader/types';
import {
  QuranReaderStyles,
  selectQuranReaderStyles,
  setQuranFont,
} from 'src/redux/slices/QuranReader/styles';
import { Section, SectionDescription, SectionLabel, SectionRow, SectionTitle } from './Section';

const views = [
  { id: QuranFont.IndoPak, label: 'IndoPak', value: QuranFont.IndoPak, name: QuranFont.IndoPak },
  { id: QuranFont.Uthmani, label: 'Uthmani', value: QuranFont.Uthmani, name: QuranFont.Uthmani },
];

const styles = {
  [QuranFont.IndoPak]: [{ id: QuranFont.IndoPak, label: 'IndoPak', value: QuranFont.IndoPak }],
  [QuranFont.Uthmani]: [
    {
      id: QuranFont.Uthmani,
      label: 'Uthmani',
      value: QuranFont.Uthmani,
      name: QuranFont.Uthmani,
    },
    {
      id: QuranFont.QPCHafs,
      label: 'QPCHafs',
      value: QuranFont.QPCHafs,
      name: QuranFont.QPCHafs,
    },
    {
      id: QuranFont.MadaniV1,
      label: 'MadaniV1',
      value: QuranFont.MadaniV1,
      name: QuranFont.MadaniV1,
    },
    {
      id: QuranFont.MadaniV2,
      label: 'MadaniV2',
      value: QuranFont.MadaniV2,
      name: QuranFont.MadaniV2,
    },
  ],
};

// given quranFont [all quran fonts variants], check whether it belongs to IndoPak or Uthmani
const getSelectedView = (font: QuranFont) => {
  const [view] = Object.entries(styles).find(([, values]) => values.some((v) => v.id === font));
  return view;
};
const getLabel = (font: QuranFont, selectedView) =>
  styles[selectedView].find((v) => v.id === font)?.label;

const QuranFontSection = () => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { quranFont } = quranReaderStyles;
  const selectedView = getSelectedView(quranFont);

  return (
    <Section>
      <SectionTitle>Quran Font</SectionTitle>
      <SectionRow>
        <SectionLabel>View</SectionLabel>
        <RadioGroup
          onChange={(value) => dispatch(setQuranFont(value as QuranFont))}
          value={selectedView}
          label="Mode"
          items={views}
          orientation={RadioGroupOrientation.Horizontal}
        />
      </SectionRow>
      <SectionRow>
        <SectionLabel>Style</SectionLabel>
        <Combobox
          id="quran-font-styles"
          value={quranFont}
          initialInputValue={getLabel(quranFont, selectedView)}
          items={styles[selectedView]}
          onChange={(value) => dispatch(setQuranFont(value as QuranFont))}
        />
      </SectionRow>
      <SectionDescription>
        The system theme automatically adopts to your light/dark mode settings
      </SectionDescription>
    </Section>
  );
};

export default QuranFontSection;
