/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './QuranFontSection.module.scss';
import QuranFontSectionFooter from './QuranFontSectionFooter';
import Section from './Section';
import VersePreview from './VersePreview';

import Counter from 'src/components/dls/Counter/Counter';
import Select from 'src/components/dls/Forms/Select';
import Switch from 'src/components/dls/Switch/Switch';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import {
  decreaseQuranTextFontScale,
  increaseQuranTextFontScale,
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  setQuranFont,
  setMushafLines,
} from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont } from 'types/QuranReader';

const QuranFontSection = () => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { quranFont, quranTextFontScale, mushafLines } = quranReaderStyles;
  // when one of the view is selected, user can choose which font they want to use
  const fonts = useMemo(
    () => ({
      [QuranFont.IndoPak]: [
        { id: QuranFont.IndoPak, label: t(`fonts.${QuranFont.IndoPak}`), value: QuranFont.IndoPak },
      ],
      [QuranFont.Tajweed]: [
        { id: QuranFont.Tajweed, label: t(`fonts.${QuranFont.Tajweed}`), value: QuranFont.Tajweed },
      ],
      [QuranFont.Uthmani]: [
        {
          id: QuranFont.QPCHafs,
          label: t(`fonts.${QuranFont.QPCHafs}`),
          value: QuranFont.QPCHafs,
          name: QuranFont.QPCHafs,
        },
        {
          id: QuranFont.MadaniV1,
          label: t(`fonts.${QuranFont.MadaniV1}`),
          value: QuranFont.MadaniV1,
          name: QuranFont.MadaniV1,
        },
        {
          id: QuranFont.MadaniV2,
          label: t(`fonts.${QuranFont.MadaniV2}`),
          value: QuranFont.MadaniV2,
          name: QuranFont.MadaniV2,
        },
      ],
    }),
    [t],
  );

  // given quranFont [all quran fonts variants], check whether it belongs to IndoPak or Uthmani
  // for example if it's QuranFont.MadaniV1, it belongs to QuranFont.Uthmani
  // if it's QuranFont.IndoPak, it belongs to QuranFont.IndoPak
  const getSelectedType = (font: QuranFont, locale: string) => {
    const selectedViewEntry = Object.entries(fonts).find(([, values]) =>
      values.some((v) => v.id === font),
    );
    if (selectedViewEntry) {
      const [view] = selectedViewEntry;
      return view;
    }
    // if no font is given, or invalid font is given, get type for default font
    return getSelectedType(getQuranReaderStylesInitialState(locale).quranFont, locale);
  };

  // get default font for selected type. We take the first font in this case
  // for example for QurantFont.Uthmani, it will be QuranFont.QPCHafs
  const getDefaultFont = (selectedType: string) => {
    const [font] = fonts[selectedType];
    return font.value;
  };
  const selectedType = getSelectedType(quranFont, lang);
  const lines = useMemo(
    () =>
      Object.values(MushafLines).map((line) => ({
        id: line,
        label: t(`fonts.${line}`),
        value: line,
        name: line,
      })),
    [t],
  );
  // in the UI, we have two view / font categories, indopak and uthmani.
  const types = useMemo(
    () =>
      [QuranFont.Uthmani, QuranFont.IndoPak, QuranFont.Tajweed].map((font) => ({
        name: t(`fonts.${font}`),
        value: font,
      })),
    [t],
  );

  return (
    <Section>
      <Section.Title>{t('fonts.quran-font')}</Section.Title>
      <Section.Row>
        <div className={styles.versePreviewContainer}>
          <VersePreview />
        </div>
      </Section.Row>
      <Section.Row>
        <Switch
          items={types}
          selected={selectedType}
          onSelect={(value) => dispatch(setQuranFont(getDefaultFont(value)))}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('style')}</Section.Label>
        <Select
          id="quranFontStyles"
          name="quranFontStyles"
          options={fonts[selectedType]}
          value={quranFont}
          onChange={(value) => dispatch(setQuranFont(value as QuranFont))}
        />
      </Section.Row>
      {selectedType === QuranFont.IndoPak && (
        <Section.Row>
          <Section.Label>{t('fonts.lines')}</Section.Label>
          <Select
            id="lines"
            name="lines"
            options={lines}
            value={mushafLines}
            onChange={(value: MushafLines) => dispatch(setMushafLines(value))}
          />
        </Section.Row>
      )}
      <Section.Row>
        <Section.Label>{t('fonts.font-size')}</Section.Label>
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
      <QuranFontSectionFooter quranFont={quranFont} />
    </Section>
  );
};

export default QuranFontSection;
