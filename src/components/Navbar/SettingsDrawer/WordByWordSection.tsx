import React from 'react';

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
  selectWordByWordByWordPreferences,
  selectWordByWordLocale,
  setSelectedWordByWordLocale,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { getLocaleName } from 'src/utils/locale';

const WBW_LOCALES = ['en', 'ur', 'id', 'bn', 'tr', 'fa', 'ru', 'hi', 'de', 'ta', 'inh'];
const WORD_BY_WORD_LOCALES_OPTIONS = WBW_LOCALES.map((locale) => ({
  label: getLocaleName(locale),
  value: locale,
}));

const WordByWordSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const wordByWordLocale = useSelector(selectWordByWordLocale);

  /**
   * Handle when the word by word locale changes.
   *
   * @param {string} value
   */
  const onWordByWordLocaleChange = (value: string) => {
    dispatch(setSelectedWordByWordLocale({ value, locale: lang }));
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
              onChange={(checked) => dispatch(setShowWordByWordTranslation(checked))}
            />
          </div>
          <div>
            <Checkbox
              checked={showWordByWordTransliteration}
              id="wbw-transliteration"
              name="wbw-transliteration"
              label={t('transliteration')}
              onChange={(checked) => dispatch(setShowWordByWordTransliteration(checked))}
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
