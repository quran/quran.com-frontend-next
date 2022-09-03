import React from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Section from './Section';
import styles from './WordByWordSection.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from '@/dls/Forms/Select';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import usePersistPreferenceGroup from 'src/hooks/auth/usePersistPreferenceGroup';
import {
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setSelectedWordByWordLocale,
  selectReadingPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from 'src/utils/eventLogger';
import { getLocaleName } from 'src/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const WBW_LOCALES = ['en', 'ur', 'id', 'bn', 'tr', 'fa', 'ru', 'hi', 'de', 'ta', 'inh'];
export const WORD_BY_WORD_LOCALES_OPTIONS = WBW_LOCALES.map((locale) => ({
  label: getLocaleName(locale),
  value: locale,
}));

const WordByWordSection = () => {
  const { t, lang } = useTranslation('common');
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const readingPreferences = useSelector(selectReadingPreferences, shallowEqual);
  const {
    showWordByWordTranslation,
    showWordByWordTransliteration,
    selectedWordByWordLocale: wordByWordLocale,
  } = readingPreferences;
  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {string | number|boolean} value
   * @param {Action} action
   */
  const onWordByWordSettingsChange = (
    key: string,
    value: string | number | boolean,
    action: Action,
    undoAction: Action,
  ) => {
    onSettingsChange(key, value, action, undoAction, PreferenceGroup.READING);
  };

  /**
   * Handle when the word by word locale changes.
   *
   * @param {string} value
   */
  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_locale', wordByWordLocale, value);
    onWordByWordSettingsChange(
      'selectedWordByWordLocale',
      value,
      setSelectedWordByWordLocale({ value, locale: lang }),
      setSelectedWordByWordLocale({ value: wordByWordLocale, locale: lang }),
    );
  };

  const onShowWordByWordTranslationChange = (checked: boolean) => {
    logValueChange('wbw_translation', !checked, checked);
    onWordByWordSettingsChange(
      'showWordByWordTranslation',
      checked,
      setShowWordByWordTranslation(checked),
      setShowWordByWordTranslation(!checked),
    );
  };

  const onShowWordByWordTransliterationChange = (checked: boolean) => {
    logValueChange('wbw_transliteration', !checked, checked);
    onWordByWordSettingsChange(
      'showWordByWordTransliteration',
      checked,
      setShowWordByWordTransliteration(checked),
      setShowWordByWordTransliteration(!checked),
    );
  };

  return (
    <Section>
      <Section.Title isLoading={isLoading}>
        {t('wbw')}
        <HelperTooltip>{t('settings.wbw-helper')}</HelperTooltip>
      </Section.Title>
      <Section.Row>
        <div className={styles.checkboxContainer}>
          <div>
            <Checkbox
              checked={showWordByWordTranslation}
              id="wbw-translation"
              name="wbw-translation"
              label={t('translation')}
              onChange={onShowWordByWordTranslationChange}
            />
          </div>
          <div>
            <Checkbox
              checked={showWordByWordTransliteration}
              id="wbw-transliteration"
              name="wbw-transliteration"
              label={t('transliteration')}
              onChange={onShowWordByWordTransliterationChange}
            />
          </div>
        </div>
      </Section.Row>
      {showWordByWordTranslation && (
        <Section.Row>
          <Section.Label>{t('wbw-trans-lang')}</Section.Label>
          <Select
            size={SelectSize.Small}
            id="wordByWord"
            name="wordByWord"
            options={WORD_BY_WORD_LOCALES_OPTIONS}
            value={wordByWordLocale}
            onChange={onWordByWordLocaleChange}
          />
        </Section.Row>
      )}
    </Section>
  );
};

export default WordByWordSection;
