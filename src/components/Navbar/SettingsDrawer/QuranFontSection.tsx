/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './QuranFontSection.module.scss';
import QuranFontSectionFooter from './QuranFontSectionFooter';
import Section from './Section';
import VersePreview from './VersePreview';

import Counter from '@/dls/Counter/Counter';
import Select from '@/dls/Forms/Select';
import Switch from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { resetLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import {
  decreaseQuranTextFontScale,
  increaseQuranTextFontScale,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  setQuranFont,
  setMushafLines,
  MAXIMUM_QURAN_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { MushafLines, QuranFont } from 'types/QuranReader';

const QuranFontSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const { quranFont, quranTextFontScale, mushafLines } = quranReaderStyles;
  // when one of the view is selected, user can choose which font they want to use
  // eslint-disable-next-line react-func/max-lines-per-function
  const fonts = useMemo(() => {
    return {
      [QuranFont.IndoPak]: [
        { id: QuranFont.IndoPak, label: t(`fonts.${QuranFont.IndoPak}`), value: QuranFont.IndoPak },
      ],
      [QuranFont.Tajweed]: [
        {
          id: QuranFont.TajweedV4,
          label: t(`fonts.${QuranFont.TajweedV4}`),
          value: QuranFont.TajweedV4,
        },
      ],
      [QuranFont.Uthmani]: [
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
        {
          id: QuranFont.QPCHafs,
          label: t(`fonts.${QuranFont.QPCHafs}`),
          value: QuranFont.QPCHafs,
          name: QuranFont.QPCHafs,
        },
      ],
    } as Record<QuranFont, { id: QuranFont; label: string; value: QuranFont; name: QuranFont }[]>;
  }, [t]);

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
  const getDefaultFont = (selectedType: QuranFont): QuranFont => {
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

  const types = useMemo(
    () =>
      [QuranFont.Uthmani, QuranFont.IndoPak, QuranFont.Tajweed].map((font) => ({
        name: t(`fonts.${font}`),
        value: font,
      })),
    [t],
  );

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {string | number} value
   * @param {Action} action
   */
  const onFontSettingsChange = (
    key: string,
    value: string | number,
    action: Action,
    undoAction: Action,
  ) => {
    onSettingsChange(key, value, action, undoAction, PreferenceGroup.QURAN_READER_STYLES);

    // only reset the loaded fonts when font settings change
    if (key !== 'quranTextFontScale') {
      // reset the loaded Fonts when we switch the font
      dispatch(resetLoadedFontFaces());
    }
  };

  const onFontChange = (value: QuranFont) => {
    logValueChange('font_family', selectedType, value);
    const fontValue = getDefaultFont(value);
    onFontSettingsChange(
      'quranFont',
      fontValue,
      setQuranFont({ quranFont: fontValue, locale: lang }),
      setQuranFont({ quranFont: quranReaderStyles.quranFont, locale: lang }),
    );
  };

  const onFontStyleChange = (value: QuranFont) => {
    logValueChange('font_style', quranFont, value);
    onFontSettingsChange(
      'quranFont',
      value,
      setQuranFont({ quranFont: value, locale: lang }),
      setQuranFont({ quranFont: quranReaderStyles.quranFont, locale: lang }),
    );
  };

  const onMushafLinesChange = (value: MushafLines) => {
    logValueChange('mushaf_lines', mushafLines, value);
    onFontSettingsChange(
      'mushafLines',
      value,
      setMushafLines({ mushafLines: value, locale: lang }),
      setMushafLines({ mushafLines: quranReaderStyles.mushafLines, locale: lang }),
    );
  };

  const onFontScaleDecreaseClicked = () => {
    const value = quranTextFontScale - 1;
    logValueChange('font_scale', quranTextFontScale, value);
    onFontSettingsChange(
      'quranTextFontScale',
      value,
      decreaseQuranTextFontScale(),
      increaseQuranTextFontScale(),
    );
  };

  const onFontScaleIncreaseClicked = () => {
    const value = quranTextFontScale + 1;
    logValueChange('font_scale', quranTextFontScale, value);
    onFontSettingsChange(
      'quranTextFontScale',
      value,
      increaseQuranTextFontScale(),
      decreaseQuranTextFontScale(),
    );
  };

  return (
    <Section id="quran-font-section">
      <Section.Title isLoading={isLoading}>{t('fonts.quran-font')}</Section.Title>
      <Section.Row>
        <Switch items={types} selected={selectedType} onSelect={onFontChange} />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('style')}</Section.Label>
        <Select
          id="quranFontStyles"
          name="quranFontStyles"
          options={fonts[selectedType]}
          value={quranFont}
          onChange={onFontStyleChange}
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
            onChange={onMushafLinesChange}
          />
        </Section.Row>
      )}
      <Section.Row id="font-size-section">
        <Section.Label>{t('fonts.font-size')}</Section.Label>
        <Counter
          count={quranTextFontScale}
          onDecrement={quranTextFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked}
          onIncrement={
            quranTextFontScale === MAXIMUM_QURAN_FONT_STEP ? null : onFontScaleIncreaseClicked
          }
        />
      </Section.Row>
      <Section.Row>
        <QuranFontSectionFooter quranFont={quranFont} />
      </Section.Row>
      <Section.Row>
        <div className={styles.versePreviewContainer}>
          <VersePreview />
        </div>
      </Section.Row>
    </Section>
  );
};

export default QuranFontSection;
