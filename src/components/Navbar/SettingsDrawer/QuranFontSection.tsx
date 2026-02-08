/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import { Action } from '@reduxjs/toolkit';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './QuranFontSection.module.scss';
import ReciterSection from './ReciterSection';
import Section from './Section';

import Counter from '@/dls/Counter/Counter';
import Select from '@/dls/Forms/Select';
import Switch from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CheckIcon from '@/icons/check.svg';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { resetLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import {
  decreaseQuranTextFontScale,
  increaseQuranTextFontScale,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  setQuranFont,
  setMushafLines,
  setShowTajweedRules,
  MAXIMUM_QURAN_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import { TestId } from '@/tests/test-ids';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import { logEvent, logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const QuranFontSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();
  const { quranFont, quranTextFontScale, mushafLines, showTajweedRules } = quranReaderStyles;
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
    logEvent(`font_family_changed_to_${value}`);
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
    logEvent(`font_style_changed_to_${value}`);
    logValueChange('font_style', quranFont, value);
    onFontSettingsChange(
      'quranFont',
      value,
      setQuranFont({ quranFont: value, locale: lang }),
      setQuranFont({ quranFont: quranReaderStyles.quranFont, locale: lang }),
    );
  };

  const onMushafLinesChange = (value: MushafLines) => {
    logEvent(`mushaf_lines_changed_to_${value}`);
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
    logEvent('quran_font_size_decreased');
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
    logEvent('quran_font_size_increased');
    logValueChange('font_scale', quranTextFontScale, value);
    onFontSettingsChange(
      'quranTextFontScale',
      value,
      increaseQuranTextFontScale(),
      decreaseQuranTextFontScale(),
    );
  };

  const onShowTajweedRulesChange = (checked: boolean) => {
    logEvent(`show_tajweed_rules_changed_to_${checked}`);
    logValueChange('show_tajweed_rules', showTajweedRules, checked);
    onSettingsChange(
      'showTajweedRules',
      checked,
      setShowTajweedRules(checked),
      setShowTajweedRules(!checked),
      PreferenceGroup.QURAN_READER_STYLES,
    );
  };

  return (
    <Section id="quran-font-section" hideSeparator>
      <Section.Row>
        <Switch
          items={types}
          selected={selectedType}
          onSelect={onFontChange}
          className={styles.fontSwitch}
          shouldHideSeparators
        />
      </Section.Row>

      {selectedType === QuranFont.Uthmani && (
        <Section.Row className={styles.fontStyleSection}>
          <Section.Label className={styles.fontStyleLabel}>
            {t('quran-reader:font-style')}
          </Section.Label>
          <Select
            id="quranFontStyles"
            name="quranFontStyles"
            options={fonts[selectedType]}
            value={quranFont}
            onChange={onFontStyleChange}
            testId={`quran-font-styles-${selectedType}`}
            className={styles.select}
            arrowClassName={styles.selectArrow}
          />
        </Section.Row>
      )}
      {selectedType === QuranFont.IndoPak && (
        <Section.Row className={styles.fontStyleSection}>
          <Section.Label className={styles.fontStyleLabel}>{t('fonts.lines')}</Section.Label>
          <Select
            id="lines"
            name="lines"
            testId={TestId.LINES}
            options={lines}
            value={mushafLines}
            onChange={onMushafLinesChange}
            className={styles.select}
            arrowClassName={styles.selectArrow}
          />
        </Section.Row>
      )}
      {selectedType === QuranFont.Tajweed && (
        <Section.Row className={styles.tajweedRulesSection}>
          <Section.Label className={styles.tajweedRulesLabel}>
            {t('quran-reader:show-tajweed-rules')}
          </Section.Label>
          <label htmlFor="show-tajweed-rules" className={styles.tajweedCheckboxWrapper}>
            <input
              type="checkbox"
              id="show-tajweed-rules"
              aria-label={t('quran-reader:show-tajweed-rules')}
              checked={showTajweedRules}
              onChange={(e) => onShowTajweedRulesChange(e.target.checked)}
              className={styles.tajweedHiddenCheckbox}
            />
            <span
              className={classNames(styles.tajweedCheckbox, {
                [styles.tajweedCheckboxChecked]: showTajweedRules,
              })}
            >
              {showTajweedRules && <CheckIcon className={styles.tajweedCheckIcon} />}
            </span>
          </label>
        </Section.Row>
      )}
      <Section.Row id="font-size-section" className={styles.fontSizeSection}>
        <Section.Label className={styles.fontStyleLabel}>{t('fonts.font-size')}</Section.Label>
        <Counter
          count={quranTextFontScale}
          onDecrement={quranTextFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked}
          onIncrement={
            quranTextFontScale === MAXIMUM_QURAN_FONT_STEP ? null : onFontScaleIncreaseClicked
          }
          className={styles.counter}
        />
      </Section.Row>
      <ReciterSection />
    </Section>
  );
};

export default QuranFontSection;
