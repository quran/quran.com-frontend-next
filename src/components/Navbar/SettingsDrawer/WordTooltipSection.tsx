import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import { WORD_BY_WORD_LOCALES_OPTIONS } from './WordByWordSection';
import styles from './WordByWordSection.module.scss';

import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from 'src/components/dls/Forms/Select';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import {
  setShowTooltipFor,
  selectShowTooltipFor,
  selectWordByWordLocale,
  setSelectedWordByWordLocale,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { removeItemFromArray, areArraysEqual } from 'src/utils/array';
import { logValueChange } from 'src/utils/eventLogger';
import QueryParam from 'types/QueryParam';
import { WordByWordType } from 'types/QuranReader';

const WordTooltipSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const router = useRouter();
  const showTooltipFor = useSelector(selectShowTooltipFor, areArraysEqual);
  const wordByWordLocale = useSelector(selectWordByWordLocale);

  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_tooltip_locale', wordByWordLocale, value);
    router.query[QueryParam.WBW_LOCALE] = value;
    router.push(router, undefined, { shallow: true });
    dispatch(setSelectedWordByWordLocale({ value, locale: lang }));
  };

  const onChange = (type: WordByWordType) => (checked: boolean) => {
    // eslint-disable-next-line no-debugger
    debugger;
    const nextShowTooltipFor = checked
      ? [...showTooltipFor, type]
      : removeItemFromArray(type, showTooltipFor);
    logValueChange('wbw_tooltip', showTooltipFor, nextShowTooltipFor);
    dispatch(setShowTooltipFor(nextShowTooltipFor));
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
