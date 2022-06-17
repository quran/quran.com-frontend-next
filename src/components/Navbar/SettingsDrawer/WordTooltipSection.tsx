import React from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import Section from './Section';
import { WORD_BY_WORD_LOCALES_OPTIONS } from './WordByWordSection';
import styles from './WordByWordSection.module.scss';

import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import usePersistPreferenceGroup from 'src/hooks/usePersistPreferenceGroup';
import {
  setShowTooltipFor,
  setSelectedWordByWordLocale,
  selectReadingPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import SliceName from 'src/redux/types/SliceName';
import { removeItemFromArray } from 'src/utils/array';
import { logValueChange } from 'src/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import QueryParam from 'types/QueryParam';
import { WordByWordType } from 'types/QuranReader';

const WordTooltipSection = () => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const { onSettingsChange } = usePersistPreferenceGroup();
  const readingPreferences = useSelector(selectReadingPreferences, shallowEqual);
  const { selectedWordByWordLocale: wordByWordLocale, showTooltipFor } = readingPreferences;

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {string | string[]} value
   * @param {Action} action
   */
  const onWordTooltipSettingsChange = (key: string, value: string | string[], action: Action) => {
    onSettingsChange(
      key,
      value,
      action,
      readingPreferences,
      SliceName.READING_PREFERENCES,
      PreferenceGroup.READING,
    );
  };

  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_tooltip_locale', wordByWordLocale, value);
    router.query[QueryParam.WBW_LOCALE] = value;
    router.push(router, undefined, { shallow: true });
    onWordTooltipSettingsChange(
      'selectedWordByWordLocale',
      value,
      setSelectedWordByWordLocale({ value, locale: lang }),
    );
  };

  const onChange = (type: WordByWordType) => (checked: boolean) => {
    const nextShowTooltipFor = checked
      ? [...showTooltipFor, type]
      : removeItemFromArray(type, showTooltipFor);
    logValueChange('wbw_tooltip', showTooltipFor, nextShowTooltipFor);
    onWordTooltipSettingsChange(
      'showTooltipFor',
      nextShowTooltipFor,
      setShowTooltipFor(nextShowTooltipFor),
    );
  };

  return (
    <Section>
      <Section.Title>
        {t('word-tooltip')}
        <HelperTooltip>{t('settings.word-tooltip-helper')}</HelperTooltip>
      </Section.Title>
      <Section.Row>
        <div className={styles.checkboxContainer}>
          <div>
            <Checkbox
              checked={showTooltipFor.includes(WordByWordType.Translation)}
              id="word-tooltip-translation"
              name="word-tooltip-translation"
              label={t('translation')}
              onChange={onChange(WordByWordType.Translation)}
            />
          </div>
          <div>
            <Checkbox
              checked={showTooltipFor.includes(WordByWordType.Transliteration)}
              id="word-tooltip-transliteration"
              name="word-tooltip-transliteration"
              label={t('transliteration')}
              onChange={onChange(WordByWordType.Transliteration)}
            />
          </div>
        </div>
      </Section.Row>
      {showTooltipFor && showTooltipFor.includes(WordByWordType.Translation) && (
        <Section.Row>
          <Section.Label>{t('tooltip-trans-lang')}</Section.Label>
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

export default WordTooltipSection;
