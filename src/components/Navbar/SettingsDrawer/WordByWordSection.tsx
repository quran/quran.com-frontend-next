/* eslint-disable i18next/no-literal-string */
/* eslint-disable max-lines */

import { Action } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Section from './Section';
import styles from './WordByWordSection.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Counter from '@/dls/Counter/Counter';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Select, { SelectSize } from '@/dls/Forms/Select';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectReadingPreferences,
  setSelectedWordByWordLocale,
  setWordByWordContentType,
  setWordByWordDisplay,
  setWordClickFunctionality,
} from '@/redux/slices/QuranReader/readingPreferences';
import {
  MAXIMUM_WORD_BY_WORD_FONT_STEP,
  MINIMUM_FONT_STEP,
  decreaseWordByWordFontScale,
  increaseWordByWordFontScale,
  selectWordByWordFontScale,
} from '@/redux/slices/QuranReader/styles';
import { WordByWordTranslationsResponse } from '@/types/ApiResponses';
import QueryParam from '@/types/QueryParam';
import { WordByWordDisplay, WordByWordType, WordClickFunctionality } from '@/types/QuranReader';
import { makeWordByWordTranslationsUrl } from '@/utils/apiPaths';
import { removeItemFromArray } from '@/utils/array';
import { logValueChange } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const WordByWordSection = () => {
  const { t, lang } = useTranslation('common');
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const router = useRouter();

  const readingPreferences = useSelector(selectReadingPreferences, shallowEqual);
  const {
    selectedWordByWordLocale: wordByWordLocale,
    wordByWordDisplay,
    wordByWordContentType,
    wordClickFunctionality,
  } = readingPreferences;

  const wordByWordFontScale = useSelector(selectWordByWordFontScale, shallowEqual);

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
    value: string | number | boolean | string[],
    action: Action,
    undoAction: Action,
    isReaderStyles = false,
  ) => {
    onSettingsChange(
      key,
      value,
      action,
      undoAction,
      isReaderStyles ? PreferenceGroup.QURAN_READER_STYLES : PreferenceGroup.READING,
    );
  };

  const onFontScaleIncreaseClicked = () => {
    const newValue = wordByWordFontScale + 1;
    logValueChange('word_by_word_font_scale', wordByWordFontScale, newValue);
    onWordByWordSettingsChange(
      'wordByWordFontScale',
      newValue,
      increaseWordByWordFontScale(),
      decreaseWordByWordFontScale(),
      true,
    );
  };

  const onFontScaleDecreaseClicked = () => {
    const newValue = wordByWordFontScale - 1;
    logValueChange('word_by_word_font_scale', wordByWordFontScale, newValue);
    onWordByWordSettingsChange(
      'wordByWordFontScale',
      newValue,
      decreaseWordByWordFontScale(),
      increaseWordByWordFontScale(),
      true,
    );
  };

  const onWordByWordLocaleChange = (value: string) => {
    logValueChange('wbw_locale', wordByWordLocale, value);
    router.query[QueryParam.WBW_LOCALE] = value;
    router.push(router, undefined, { shallow: true });
    onWordByWordSettingsChange(
      'selectedWordByWordLocale',
      value,
      setSelectedWordByWordLocale({ value, locale: lang }),
      setSelectedWordByWordLocale({ value: wordByWordLocale, locale: lang }),
    );
  };

  const onRecitationChange = (isChecked: boolean) => {
    const newValue = isChecked ? WordClickFunctionality.PlayAudio : WordClickFunctionality.NoAudio;
    const oldValue =
      newValue === WordClickFunctionality.PlayAudio
        ? WordClickFunctionality.NoAudio
        : WordClickFunctionality.PlayAudio;
    logValueChange('audio_settings_word_click_functionality', oldValue, newValue);
    onWordByWordSettingsChange(
      'wordClickFunctionality',
      newValue,
      setWordClickFunctionality(newValue),
      setWordClickFunctionality(oldValue),
    );
  };

  const onDisplaySettingChange = (isInlineCheckbox: boolean, isChecked: boolean) => {
    const type = isInlineCheckbox ? WordByWordDisplay.INLINE : WordByWordDisplay.TOOLTIP;
    const nextWordByWordDisplay = isChecked
      ? [...wordByWordDisplay, type]
      : removeItemFromArray(type, wordByWordDisplay);
    logValueChange('wbw_display', wordByWordDisplay, nextWordByWordDisplay);
    onWordByWordSettingsChange(
      'wordByWordDisplay',
      nextWordByWordDisplay,
      setWordByWordDisplay(nextWordByWordDisplay),
      setWordByWordDisplay(wordByWordDisplay),
    );
  };

  const onContentTypeChange = (isTranslationCheckbox: boolean, isChecked: boolean) => {
    const type = isTranslationCheckbox
      ? WordByWordType.Translation
      : WordByWordType.Transliteration;
    const nextWordByWordContentType = isChecked
      ? [...wordByWordContentType, type]
      : removeItemFromArray(type, wordByWordContentType);
    logValueChange('wbw_content_type', wordByWordContentType, nextWordByWordContentType);
    onWordByWordSettingsChange(
      'wordByWordContentType',
      nextWordByWordContentType,
      setWordByWordContentType(nextWordByWordContentType),
      setWordByWordContentType(wordByWordContentType),
    );
  };

  const shouldDisableWordByWordDisplay = !wordByWordContentType || !wordByWordContentType.length;
  const shouldDisableLanguageSelect =
    !wordByWordContentType || !wordByWordContentType.includes(WordByWordType.Translation);

  return (
    <Section>
      <Section.Title isLoading={isLoading}>{t('wbw')}</Section.Title>
      <Section.Row>
        <div className={styles.checkboxContainer}>
          <div id="wbw-translation-section">
            <Checkbox
              checked={wordByWordContentType.includes(WordByWordType.Translation)}
              id="wbw-translation"
              name="wbw-translation"
              label={t('translation')}
              onChange={(isChecked) => onContentTypeChange(true, isChecked)}
            />
          </div>

          <div id="wbw-transliteration-section">
            <Checkbox
              checked={wordByWordContentType.includes(WordByWordType.Transliteration)}
              id="wbw-transliteration"
              name="wbw-transliteration"
              label={t('transliteration')}
              onChange={(isChecked) => onContentTypeChange(false, isChecked)}
            />
          </div>

          <div id="wbw-recitation-section">
            <Checkbox
              checked={wordClickFunctionality === WordClickFunctionality.PlayAudio}
              id="wbw-recitation"
              name="wbw-recitation"
              label={t('recitation')}
              onChange={onRecitationChange}
            />
          </div>

          <Section.Footer>
            <Trans
              components={{ span: <span className={styles.source} /> }}
              i18nKey="common:reciter-summary"
              values={{ reciterName: 'Shaikh Wisam Sharieff' }}
            />
          </Section.Footer>
        </div>
      </Section.Row>
      <Separator className={styles.separator} />
      <Section.Row>
        <Section.Label>{t('trans-lang')}</Section.Label>
        <DataFetcher
          queryKey={makeWordByWordTranslationsUrl(lang)}
          render={(data: WordByWordTranslationsResponse) => {
            const uniqueData = uniqBy(data.wordByWordTranslations, 'isoCode');

            const options = uniqueData.map(({ isoCode, languageName }) => ({
              label: getLocaleName(isoCode) || languageName,
              value: isoCode,
            }));

            return (
              <Select
                size={SelectSize.Small}
                id="wordByWord"
                name="wordByWord"
                options={options}
                value={wordByWordLocale}
                disabled={shouldDisableLanguageSelect}
                onChange={onWordByWordLocaleChange}
              />
            );
          }}
        />
      </Section.Row>
      <Section.Footer>
        <Trans
          components={{
            link: <Link isNewTab href="https://quranwbw.com/" variant={LinkVariant.Blend} />,
          }}
          i18nKey="common:wbw-lang-summary"
          values={{ source: 'quranwbw' }}
        />
      </Section.Footer>
      <div id="wbw-display-section">
        <Section.Label>
          <p className={styles.label}>{t('display')}</p>
        </Section.Label>
        <Section.Row>
          <div className={styles.checkboxContainer}>
            <Checkbox
              checked={wordByWordDisplay.includes(WordByWordDisplay.INLINE)}
              id="inline"
              name="inline"
              label={t('inline')}
              disabled={shouldDisableWordByWordDisplay}
              onChange={(isChecked) => onDisplaySettingChange(true, isChecked)}
            />
            <Checkbox
              checked={wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP)}
              id="tooltip"
              name="word-tooltip"
              label={t('tooltip')}
              disabled={shouldDisableWordByWordDisplay}
              onChange={(isChecked) => onDisplaySettingChange(false, isChecked)}
            />
          </div>
        </Section.Row>
      </div>
      <Section.Row>
        <Section.Label>{t('fonts.font-size')}</Section.Label>
        <Counter
          count={wordByWordFontScale}
          onIncrement={
            MAXIMUM_WORD_BY_WORD_FONT_STEP === wordByWordFontScale
              ? null
              : onFontScaleIncreaseClicked
          }
          onDecrement={
            MINIMUM_FONT_STEP === wordByWordFontScale ? null : onFontScaleDecreaseClicked
          }
        />
      </Section.Row>
    </Section>
  );
};

export default WordByWordSection;
