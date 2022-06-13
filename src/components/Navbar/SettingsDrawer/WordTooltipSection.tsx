import React from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import { WORD_BY_WORD_LOCALES_OPTIONS } from './WordByWordSection';
import styles from './WordByWordSection.module.scss';

import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import {
  setShowTooltipFor,
  setSelectedWordByWordLocale,
  selectReadingPreferences,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { removeItemFromArray } from 'src/utils/array';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { logValueChange } from 'src/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import QueryParam from 'types/QueryParam';
import { WordByWordType } from 'types/QuranReader';

const WordTooltipSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const router = useRouter();
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
  const onSettingsChange = (key: string, value: string | string[], action: Action) => {
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

  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_tooltip_locale', wordByWordLocale, value);
    router.query[QueryParam.WBW_LOCALE] = value;
    router.push(router, undefined, { shallow: true });
    onSettingsChange(
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
    onSettingsChange('showTooltipFor', nextShowTooltipFor, setShowTooltipFor(nextShowTooltipFor));
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
