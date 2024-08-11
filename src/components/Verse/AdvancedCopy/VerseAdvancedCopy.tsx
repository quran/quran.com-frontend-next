/* eslint-disable max-lines */
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { RangeSelectorType, RangeVerseItem } from './SelectorContainer';
import copyVerse from './utils/copyVerse';
import validateRangeSelection from './utils/validateRangeSelection';
import styles from './VerseAdvancedCopy.module.scss';
import VersesRangeSelector from './VersesRangeSelector';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import RadioGroup, { RadioGroupOrientation } from '@/dls/Forms/RadioGroup/RadioGroup';
import Select from '@/dls/Forms/Select';
import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { throwIfError } from '@/utils/error';
import {
  logButtonClick,
  logEvent,
  logItemSelectionChange,
  logValueChange,
} from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { generateChapterVersesKeys } from '@/utils/verse';
import { getAvailableTranslations } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  children({ onCopy, actionText, ayahSelectionComponent, loading }): React.ReactElement;
}
const RESET_BUTTON_TIMEOUT_MS = 5 * 1000;

const SINGLE_VERSE = 'single';
const MULTIPLE_VERSES = 'multiple';
const TRUE_STRING = String(true);
const FALSE_STRING = String(false);

const TO_COPY_FONTS = [
  QuranFont.Uthmani,
  QuranFont.MadaniV1,
  QuranFont.MadaniV2,
  QuranFont.IndoPak,
];

const VerseAdvancedCopy: React.FC<Props> = ({ verse, children }) => {
  const { lang, t } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  // whether we should show the range of verses or not. This will be based on user selection.
  const [showRangeOfVerses, setShowRangeOfVerses] = useState(false);
  // the items that will be passed to the range start and end dropdown selectors. The value will be populated only once the user chooses the verses range option.
  const [rangeVersesItems, setRangeVersesItems] = useState<RangeVerseItem[]>([]);
  // the key of the range start verse.
  const [rangeStartVerse, setRangeStartVerse] = useState(null);
  // the key of the range end verse.
  const [rangeEndVerse, setRangeEndVerse] = useState(null);
  // Which font to copy.
  const [shouldCopyFont, setShouldCopyFont] = useState<QuranFont>(QuranFont.Uthmani);
  // whether the selected verses' footnotes should be copied or not.
  const [shouldCopyFootnotes, setShouldCopyFootnotes] = useState(true);
  // whether we should include the translator name or not.
  const [shouldIncludeTranslatorName, setShouldIncludeTranslatorName] = useState(true);
  // a map of the IDs of the translations the users had selected and whether it should be copied or not. Will not be copied by default.
  const [translations, setTranslations] = useState<
    Record<number, { shouldBeCopied: boolean; name: string }>
  >({});
  // a custom message that will be shown to the user in the case we have an error or success.
  const [customMessageComponent, setCustomMessage] = useState(null);
  // whether the selection has been copied successfully to the clipboard or not.
  const [isCopied, setIsCopied] = useState(false);
  // objectUrl will be as href `<a> to download a txt file containing copied text.
  const [objectUrl, setObjectUrl] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(false);

  // listen to any changes to the value of isCopied.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), RESET_BUTTON_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  // Get available translations
  // because we already have call the API in settings menu. useSWR will save it to cache.
  // in this component, we will get the data from the cache.
  // so, no rerender, no layout shift.
  const { data: translationsResponse } = useSWRImmutable(makeTranslationsUrl(lang), () =>
    getAvailableTranslations(lang).then((res) => {
      throwIfError(res);
      return res;
    }),
  );

  const availableTranslations = useMemo(
    () => translationsResponse?.translations ?? [],
    [translationsResponse],
  );

  useEffect(() => {
    const responseTranslations = {};
    availableTranslations
      .filter((translation) => selectedTranslations.includes(translation.id))
      .forEach((translation) => {
        responseTranslations[translation.id] = {
          shouldBeCopied: true, // the default is to copy the translation
          name: translation.translatedName.name,
        };
      });
    setTranslations(responseTranslations);
  }, [lang, selectedTranslations, availableTranslations]);

  /**
   * Handle when either the range start/end's verse is selected.
   *
   * @param {string} selectedName the value of the name of the selected item. the value of name is the one we passed for the item inside items to the search dropdown.
   * @param {RangeSelectorType} verseSelectorId the id of the verse selector. can either be @{}
   */
  const onRangeBoundariesChange = useCallback(
    (selectedName: string, verseSelectorId: RangeSelectorType) => {
      // reset the error in-case the user has an error then re-selects another item which might solve the error.
      setCustomMessage(null);
      if (verseSelectorId === RangeSelectorType.START) {
        setRangeStartVerse(selectedName);
      } else {
        setRangeEndVerse(selectedName);
      }
    },
    [],
  );

  const onRangeOfVersesTypeSelected = () => {
    setShowRangeOfVerses(true);
    // we only need to generate the verse keys + set the range start and end only when the user hadn't selected the range already to avoid re-calculating the keys and to avoid resetting his selected range boundaries when he switches back and forth between current verse/range of verses options.
    if (!rangeStartVerse || !rangeEndVerse) {
      const keys = generateChapterVersesKeys(chaptersData, verse.chapterId as string);
      setRangeVersesItems(
        keys.map((chapterVersesKey) => ({
          id: chapterVersesKey,
          name: chapterVersesKey,
          value: chapterVersesKey,
          label: toLocalizedVerseKey(chapterVersesKey, lang),
        })),
      );
      // set the first verse's key as the default range's start verse.
      const startFromVerseNumber = verse?.verseNumber || 1;
      setRangeStartVerse(keys[startFromVerseNumber - 1]);
      // set the last verse's key as the default range's end verse.
      setRangeEndVerse(keys[keys.length - 1]);
    }
  };

  /**
   * Handle when the range type changes.
   *
   * @param {string} type
   */
  const onRangeTypeChange = (type: string) => {
    logValueChange(
      'advanced_copy_modal_range_type',
      showRangeOfVerses ? MULTIPLE_VERSES : SINGLE_VERSE,
      type,
    );
    if (type === SINGLE_VERSE) {
      setShowRangeOfVerses(false);
    } else {
      onRangeOfVersesTypeSelected();
    }
  };

  const onCopyTextClicked = () => {
    logButtonClick('advanced_copy_modal_copy');
    setIsLoadingData(true);
    // if a range is selected, we need to validate it first
    if (showRangeOfVerses) {
      const validationError = validateRangeSelection(rangeStartVerse, rangeEndVerse, t);
      // if the validation fails
      if (validationError) {
        setCustomMessage(validationError);
        setIsLoadingData(false);
        return;
      }
    }

    copyVerse({
      showRangeOfVerses,
      rangeEndVerse,
      rangeStartVerse,
      shouldCopyFootnotes,
      shouldIncludeTranslatorName,
      shouldCopyFont,
      translations,
      verseKey: verse.verseKey,
    })
      .then((blob) => {
        setIsLoadingData(false);
        setObjectUrl(window.URL.createObjectURL(blob));
        setIsCopied(true);
      })
      .catch(() => {
        setIsLoadingData(false);
      });
  };

  const onShouldCopyFontsChange = (font: string) => {
    logItemSelectionChange('advanced_copy_modal_font', font);
    setShouldCopyFont(font as QuranFont);
  };

  const onShouldIncludeTranslatorNameChange = (includeTranslatorName: string) => {
    const shouldInclude = includeTranslatorName === TRUE_STRING;
    logEvent(
      // eslint-disable-next-line i18next/no-literal-string
      `advanced_copy_modal_include_translator_${shouldInclude ? 'selected' : 'unselected'}`,
    );
    setShouldIncludeTranslatorName(shouldInclude);
  };

  /**
   * Handle when the should copy footnote radio changes.
   *
   * @param {string} shouldCopyString
   */
  const onShouldCopyFootnoteChange = (shouldCopyString: string) => {
    const shouldCopy = shouldCopyString === TRUE_STRING;
    logEvent(
      // eslint-disable-next-line i18next/no-literal-string
      `advanced_copy_modal_copy_footnote_${shouldCopy ? 'selected' : 'unselected'}`,
    );
    setShouldCopyFootnotes(shouldCopy);
  };

  /**
   * Handle when a translationId is checked/unchecked.
   *
   * @param {string} translationId
   * @returns {void}
   */
  const onCopyTranslationChange = (translationId: string): void => {
    setTranslations((prevTranslations) => {
      const shouldBeCopied = !prevTranslations[translationId].shouldBeCopied;
      logItemSelectionChange('advanced_copy_modal_translation', translationId, shouldBeCopied);
      return {
        ...prevTranslations,
        [translationId]: {
          ...prevTranslations[translationId],
          shouldBeCopied,
        },
      };
    });
  };

  const ayahSelectionComponent = (
    <>
      <p className={styles.label}>{t('select-range')}</p>
      <RadioGroup
        label="verses_range"
        orientation={RadioGroupOrientation.Horizontal}
        onChange={onRangeTypeChange}
        value={showRangeOfVerses ? MULTIPLE_VERSES : SINGLE_VERSE}
        items={[
          {
            value: SINGLE_VERSE,
            id: SINGLE_VERSE,
            label: `${t('current-verse')} ${toLocalizedVerseKey(verse.verseKey, lang)}`,
          },
          {
            value: MULTIPLE_VERSES,
            id: MULTIPLE_VERSES,
            label: t('verses-range'),
          },
        ]}
      />
      {rangeStartVerse !== null && (
        <VersesRangeSelector
          isVisible={showRangeOfVerses}
          dropdownItems={rangeVersesItems}
          rangeStartVerse={toLocalizedVerseKey(rangeStartVerse, lang)}
          rangeEndVerse={toLocalizedVerseKey(rangeEndVerse, lang)}
          onChange={onRangeBoundariesChange}
        />
      )}
      {selectedTranslations.length !== 0 && (
        <>
          <p className={styles.label}>{t('common:translations')}:</p>
          {selectedTranslations.map((translationId) =>
            translations[translationId] ? (
              <Checkbox
                key={translationId}
                onChange={() => onCopyTranslationChange(translationId.toString())}
                checked={translations[translationId].shouldBeCopied}
                id={translationId.toString()}
                label={translations[translationId].name}
              />
            ) : (
              <div key={translationId} className={styles.emptyCheckbox} />
            ),
          )}
          <p className={styles.label}>{t('include-translator')}</p>
          <RadioGroup
            label="include_translator"
            value={shouldIncludeTranslatorName ? TRUE_STRING : FALSE_STRING}
            onChange={onShouldIncludeTranslatorNameChange}
            items={[
              {
                value: TRUE_STRING,
                id: TRUE_STRING,
                label: t('common:yes'),
              },
              {
                value: FALSE_STRING,
                id: FALSE_STRING,
                label: t('common:no'),
              },
            ]}
          />
        </>
      )}
      <div className={classNames(styles.label, styles.fontLabelContainer)}>
        <p>{t('font')}</p>
        <HelperTooltip>{t('font-tooltip')}</HelperTooltip>
      </div>
      <Select
        id="arabic-font-to-copy"
        name="arabic-font-to-copy"
        placeholder={t('font-placeholder')}
        options={[
          { label: t('common:none'), value: '' },
          ...TO_COPY_FONTS.map((font) => ({
            label: t(`common:fonts.${font}`),
            value: font,
          })),
        ]}
        value={shouldCopyFont}
        onChange={(val) => onShouldCopyFontsChange(val as string)}
      />
      <p className={styles.label}>{t('copy-footnote-q')}</p>
      <RadioGroup
        label="copy_footnotes"
        value={shouldCopyFootnotes ? TRUE_STRING : FALSE_STRING}
        onChange={onShouldCopyFootnoteChange}
        items={[
          {
            value: TRUE_STRING,
            id: TRUE_STRING,
            label: t('common:yes'),
          },
          {
            value: FALSE_STRING,
            id: FALSE_STRING,
            label: t('common:no'),
          },
        ]}
      />
      {customMessageComponent && (
        <div className={styles.customMessage}>{customMessageComponent}</div>
      )}
      {objectUrl && (
        <p className={styles.customMessage}>
          {t('copy-success')}{' '}
          <Link
            href={objectUrl}
            download="quran.copy.txt"
            variant={LinkVariant.Highlight}
            onClick={() => {
              logButtonClick('advanced_copy_modal_download_file');
            }}
          >
            {t('common:click-here')}
          </Link>{' '}
          {t('download-copy')}
        </p>
      )}
    </>
  );

  return children({
    ayahSelectionComponent,
    actionText: isCopied ? t('common:copied-to-clipboard') : t('common:copy'),
    loading: isLoadingData,
    onCopy: onCopyTextClicked,
  });
};

export default VerseAdvancedCopy;
