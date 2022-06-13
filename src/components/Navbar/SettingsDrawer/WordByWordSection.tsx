import React from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './WordByWordSection.module.scss';

import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import {
  setShowWordByWordTranslation,
  setShowWordByWordTransliteration,
  setSelectedWordByWordLocale,
  selectReadingPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
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
  const dispatch = useDispatch();

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
  const onSettingsChange = (key: string, value: string | number | boolean, action: Action) => {
    if (isLoggedIn()) {
      const newReadingPreferences = { ...readingPreferences };
      // no need to persist this since it's calculated and only used internally
      delete newReadingPreferences.isUsingDefaultWordByWordLocale;
      newReadingPreferences[key] = value;
      addOrUpdateUserPreference(newReadingPreferences, PreferenceGroup.READING)
        .then(() => {
          dispatch(action);
        })
        .catch(() => {
          // TODO: show an error
        });
    } else {
      dispatch(action);
    }
  };

  /**
   * Handle when the word by word locale changes.
   *
   * @param {string} value
   */
  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_locale', wordByWordLocale, value);
    onSettingsChange(
      'selectedWordByWordLocale',
      value,
      setSelectedWordByWordLocale({ value, locale: lang }),
    );
  };

  const onShowWordByWordTranslationChange = (checked: boolean) => {
    logValueChange('wbw_translation', !checked, checked);
    dispatch(setShowWordByWordTranslation(checked));
    onSettingsChange('showWordByWordTranslation', checked, setShowWordByWordTranslation(checked));
  };

  const onShowWordByWordTransliterationChange = (checked: boolean) => {
    logValueChange('wbw_transliteration', !checked, checked);
    dispatch(setShowWordByWordTransliteration(checked));
    onSettingsChange(
      'showWordByWordTransliteration',
      checked,
      setShowWordByWordTransliteration(checked),
    );
  };

  return (
    <Section>
      <Section.Title>
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
