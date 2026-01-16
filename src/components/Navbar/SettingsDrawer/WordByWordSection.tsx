/* eslint-disable i18next/no-literal-string */
/* eslint-disable max-lines */

import { Action } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import CheckboxChip from './CheckboxChip';
import Section from './Section';
import styles from './WordByWordSection.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Counter from '@/dls/Counter/Counter';
import Select, { SelectSize } from '@/dls/Forms/Select';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import Link, { LinkVariant } from '@/dls/Link/Link';
import SpinnerContainer from '@/dls/Spinner/SpinnerContainer';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useIsMobile from '@/hooks/useIsMobile';
import {
  selectReadingPreferences,
  setSelectedWordByWordLocale,
  setWordByWordContentType,
  setWordByWordTooltipContentType,
  setWordByWordInlineContentType,
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
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const readingPreferences = useSelector(selectReadingPreferences, shallowEqual);
  const {
    selectedWordByWordLocale: wordByWordLocale,
    wordByWordDisplay,
    wordByWordTooltipContentType,
    wordByWordInlineContentType,
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
    successCallback: () => void = undefined,
  ) => {
    onSettingsChange(
      key,
      value,
      action,
      undoAction,
      isReaderStyles ? PreferenceGroup.QURAN_READER_STYLES : PreferenceGroup.READING,
      successCallback,
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
    onWordByWordSettingsChange(
      'selectedWordByWordLocale',
      value,
      setSelectedWordByWordLocale({ value, locale: lang }),
      setSelectedWordByWordLocale({ value: wordByWordLocale, locale: lang }),
      false,
      () => {
        router.query[QueryParam.WBW_LOCALE] = value;
        router.push(router, undefined, { shallow: true });
      },
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

  const onInlineTranslationChange = (isChecked: boolean) => {
    const nextWordByWordInlineContentType = isChecked
      ? [...wordByWordInlineContentType, WordByWordType.Translation]
      : removeItemFromArray(WordByWordType.Translation, wordByWordInlineContentType);
    logValueChange(
      'wbw_inline_content_type_translation',
      wordByWordInlineContentType,
      nextWordByWordInlineContentType,
    );

    // Auto-enable Inline display when any content is checked
    let nextWordByWordDisplay = wordByWordDisplay;
    if (isChecked && !wordByWordDisplay.includes(WordByWordDisplay.INLINE)) {
      nextWordByWordDisplay = [...wordByWordDisplay, WordByWordDisplay.INLINE];
    }
    // Auto-disable Inline display when all content is unchecked
    if (
      !isChecked &&
      nextWordByWordInlineContentType.length === 0 &&
      wordByWordDisplay.includes(WordByWordDisplay.INLINE)
    ) {
      nextWordByWordDisplay = removeItemFromArray(WordByWordDisplay.INLINE, wordByWordDisplay);
    }

    onWordByWordSettingsChange(
      'wordByWordInlineContentType',
      nextWordByWordInlineContentType,
      setWordByWordInlineContentType(nextWordByWordInlineContentType),
      setWordByWordInlineContentType(wordByWordInlineContentType),
    );

    if (nextWordByWordDisplay !== wordByWordDisplay) {
      dispatch(setWordByWordDisplay(nextWordByWordDisplay));
    }
  };

  const onInlineTransliterationChange = (isChecked: boolean) => {
    const nextWordByWordInlineContentType = isChecked
      ? [...wordByWordInlineContentType, WordByWordType.Transliteration]
      : removeItemFromArray(WordByWordType.Transliteration, wordByWordInlineContentType);
    logValueChange(
      'wbw_inline_content_type_transliteration',
      wordByWordInlineContentType,
      nextWordByWordInlineContentType,
    );

    // Auto-enable Inline display when any content is checked
    let nextWordByWordDisplay = wordByWordDisplay;
    if (isChecked && !wordByWordDisplay.includes(WordByWordDisplay.INLINE)) {
      nextWordByWordDisplay = [...wordByWordDisplay, WordByWordDisplay.INLINE];
    }
    // Auto-disable Inline display when all content is unchecked
    if (
      !isChecked &&
      nextWordByWordInlineContentType.length === 0 &&
      wordByWordDisplay.includes(WordByWordDisplay.INLINE)
    ) {
      nextWordByWordDisplay = removeItemFromArray(WordByWordDisplay.INLINE, wordByWordDisplay);
    }

    onWordByWordSettingsChange(
      'wordByWordInlineContentType',
      nextWordByWordInlineContentType,
      setWordByWordInlineContentType(nextWordByWordInlineContentType),
      setWordByWordInlineContentType(wordByWordInlineContentType),
    );

    if (nextWordByWordDisplay !== wordByWordDisplay) {
      dispatch(setWordByWordDisplay(nextWordByWordDisplay));
    }
  };

  const getUpdatedTooltipDisplay = (isChecked: boolean, nextContentType: WordByWordType[]) => {
    if (isChecked && !wordByWordDisplay.includes(WordByWordDisplay.TOOLTIP)) {
      return [...wordByWordDisplay, WordByWordDisplay.TOOLTIP];
    }
    if (!isChecked && nextContentType.length === 0) {
      return removeItemFromArray(WordByWordDisplay.TOOLTIP, wordByWordDisplay);
    }
    return wordByWordDisplay;
  };

  const onContentTypeChange = (isTranslationCheckbox: boolean, isChecked: boolean) => {
    const type = isTranslationCheckbox
      ? WordByWordType.Translation
      : WordByWordType.Transliteration;
    const nextWordByWordTooltipContentType = isChecked
      ? [...wordByWordTooltipContentType, type]
      : removeItemFromArray(type, wordByWordTooltipContentType);

    logValueChange(
      'wbw_content_type',
      wordByWordTooltipContentType,
      nextWordByWordTooltipContentType,
    );

    const nextWordByWordDisplay = getUpdatedTooltipDisplay(
      isChecked,
      nextWordByWordTooltipContentType,
    );
    onWordByWordSettingsChange(
      'wordByWordTooltipContentType',
      nextWordByWordTooltipContentType,
      setWordByWordTooltipContentType(nextWordByWordTooltipContentType),
      setWordByWordTooltipContentType(wordByWordTooltipContentType),
    );
    dispatch(setWordByWordContentType(nextWordByWordTooltipContentType));

    if (nextWordByWordDisplay !== wordByWordDisplay) {
      dispatch(setWordByWordDisplay(nextWordByWordDisplay));
    }
  };

  const shouldDisableLanguageSelect =
    !wordByWordTooltipContentType.includes(WordByWordType.Translation) &&
    !wordByWordInlineContentType.includes(WordByWordType.Translation);

  return (
    <Section hideSeparator className={styles.sectionContainer}>
      <div className={styles.titleRow}>
        <div className={styles.titleContainer}>
          <SpinnerContainer isLoading={isLoading}>
            <span className={styles.title}>{t('wbw')}</span>
          </SpinnerContainer>
          <HelperTooltip iconClassName={styles.helperTooltipIcon}>
            {t('quran-reader:wbw-helper-text')}
          </HelperTooltip>
        </div>

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
                testId="wbw-language-select"
                id="wordByWord"
                name="wordByWord"
                options={options}
                value={wordByWordLocale}
                disabled={shouldDisableLanguageSelect}
                onChange={onWordByWordLocaleChange}
                className={styles.select}
              />
            );
          }}
        />
      </div>
      <Section.Footer className={styles.footerOpacityUnset}>
        <Trans
          components={{
            link: <Link isNewTab href="https://quranwbw.com/" variant={LinkVariant.Blend} />,
          }}
          i18nKey="common:wbw-lang-summary"
          values={{ source: 'quranwbw' }}
        />
      </Section.Footer>
      <Section.Footer className={styles.footerWithBorder}>
        <Trans components={{ span: <span /> }} i18nKey="quran-reader:reciter-summary" />
      </Section.Footer>
      <Section.Row>
        <div>
          <p className={styles.sectionLabel}>
            {isMobile ? t('quran-reader:on-click') : t('quran-reader:on-hover')}
          </p>
          <div className={styles.checkboxContainer}>
            <div id="wbw-translation-section">
              <CheckboxChip
                checked={wordByWordTooltipContentType.includes(WordByWordType.Translation)}
                id="wbw-translation"
                name="wbw-translation"
                label={t('translation')}
                onChange={(isChecked) => onContentTypeChange(true, isChecked)}
              />
            </div>

            <div id="wbw-transliteration-section">
              <CheckboxChip
                checked={wordByWordTooltipContentType.includes(WordByWordType.Transliteration)}
                id="wbw-transliteration"
                name="wbw-transliteration"
                label={t('transliteration')}
                onChange={(isChecked) => onContentTypeChange(false, isChecked)}
              />
            </div>

            <div id="wbw-recitation-section">
              <CheckboxChip
                checked={wordClickFunctionality === WordClickFunctionality.PlayAudio}
                id="wbw-recitation"
                name="wbw-recitation"
                label={t('recitation')}
                onChange={onRecitationChange}
              />
            </div>
          </div>
        </div>
      </Section.Row>
      <Section.Row className={styles.inlineContentRow}>
        <div>
          <p className={styles.sectionLabel}>{t('quran-reader:below-word')}</p>
          <div className={styles.checkboxContainer}>
            <CheckboxChip
              checked={wordByWordInlineContentType.includes(WordByWordType.Translation)}
              id="inline-translation"
              name="inline-translation"
              label={t('translation')}
              onChange={onInlineTranslationChange}
            />
            <CheckboxChip
              checked={wordByWordInlineContentType.includes(WordByWordType.Transliteration)}
              id="inline-transliteration"
              name="inline-transliteration"
              label={t('transliteration')}
              onChange={onInlineTransliterationChange}
            />
          </div>
        </div>
      </Section.Row>
      <Section.Row className={styles.fontSizeRow}>
        <Section.Label className={styles.fontStyleLabel}>{t('fonts.font-size')}</Section.Label>
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
          className={styles.counter}
        />
      </Section.Row>
    </Section>
  );
};

export default WordByWordSection;
