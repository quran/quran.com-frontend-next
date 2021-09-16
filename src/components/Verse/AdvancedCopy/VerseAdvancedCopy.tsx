/* eslint-disable max-lines */
import React, { useState, useEffect, useCallback } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import Checkbox from '../../dls/Forms/Checkbox/Checkbox';
import RadioGroup, { RadioGroupOrientation } from '../../dls/Forms/RadioGroup/RadioGroup';

import { RangeSelectorType, RangeVerseItem } from './SelectorContainer';
import styles from './VerseAdvancedCopy.module.scss';
import VersesRangeSelector from './VersesRangeSelector';

import { getAdvancedCopyRawResult, getAvailableTranslations } from 'src/api';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import { QuranFont } from 'src/components/QuranReader/types';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { throwIfError } from 'src/utils/error';
import { getVerseNumberFromKey, generateChapterVersesKeys } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  children({ onCopy, actionText, ayahSelectionComponent }): React.ReactElement;
}
const RESET_BUTTON_TIMEOUT_MS = 5 * 1000;

/**
 * Validate the selected range start and end verse keys. The selection will be invalid in the following cases:
 *
 * 1. One of the two ranges have been cleared and don't have a value.
 * 2. The range start and end verses are the same which is not a valid range. The user should have selected current verse option instead.
 * 3. The range end verse is before the range start verse e.g. from verse 6 -> verse 4.
 *
 * @param {string} selectedRangeStartVerseKey
 * @param {string} selectedRangeEndVerseKey
 * @returns {string|null} if it's null it means the validation passed.
 */
const validateRangeSelection = (
  selectedRangeStartVerseKey: string,
  selectedRangeEndVerseKey: string,
): string | null => {
  // if one of them is empty.
  if (!selectedRangeStartVerseKey || !selectedRangeEndVerseKey) {
    return 'Range start and end must have a value.';
  }
  // if both keys are the same.
  if (selectedRangeStartVerseKey === selectedRangeEndVerseKey) {
    return 'Range start and end should be different.';
  }
  // if the selected from verse number is higher than the selected to verse number.
  if (
    getVerseNumberFromKey(selectedRangeStartVerseKey) >
    getVerseNumberFromKey(selectedRangeEndVerseKey)
  ) {
    return 'The starting verse has to be before the ending verse.';
  }
  return null;
};

const SINGLE_VERSE = 'single';
const MULTIPLE_VERSES = 'multiple';
const TRUE_STRING = String(true);
const FALSE_STRING = String(false);

const VerseAdvancedCopy: React.FC<Props> = ({ verse, children }) => {
  const { lang } = useTranslation();
  const router = useRouter();
  const { chapterId } = router.query;
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  // whether we should show the range of verses or not. This will be based on user selection.
  const [showRangeOfVerses, setShowRangeOfVerses] = useState(false);
  // the items that will be passed to the range start and end dropdown selectors. The value will be populated only once the user chooses the verses range option.
  const [rangeVersesItems, setRangeVersesItems] = useState<RangeVerseItem[]>([]);
  // the key of the range start verse.
  const [rangeStartVerse, setRangeStartVerse] = useState(null);
  // the key of the range end verse.
  const [rangeEndVerse, setRangeEndVerse] = useState(null);
  // whether the Arabic Quran text should be copied or not.
  const [shouldCopyText, setShouldCopyText] = useState(true);
  // whether the selected verses' footnotes should be copied or not.
  const [shouldCopyFootnotes, setShouldCopyFootnotes] = useState(false);
  // a map of the IDs of the translations the users had selected and whether it should be copied or not. Will not be copied by default.
  const [translations, setTranslations] = useState<
    Record<number, { shouldBeCopied: boolean; name: string }>
  >({});
  // a custom message that will be shown to the user in the case we have an error or success.
  const [customMessageComponent, setCustomMessage] = useState(null);
  // whether the selection has been copied successfully to the clipboard or not.
  const [isCopied, setIsCopied] = useState(false);

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
  const { data: availableTranslations } = useSWRImmutable(makeTranslationsUrl(lang), () =>
    getAvailableTranslations(lang).then((res) => {
      throwIfError(res);
      return res.translations;
    }),
  );

  useEffect(() => {
    const responseTranslations = {};
    availableTranslations
      .filter((translation) => selectedTranslations.includes(translation.id))
      .forEach((translation) => {
        responseTranslations[translation.id] = {
          shouldBeCopied: false, // the default is to not copy the translation
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
      const keys = generateChapterVersesKeys(chapterId as string);
      setRangeVersesItems(
        keys.map((chapterVersesKey) => ({
          id: chapterVersesKey,
          name: chapterVersesKey,
          value: chapterVersesKey,
          label: chapterVersesKey,
        })),
      );
      // set the first verse's key as the default range's start verse.
      setRangeStartVerse(keys[0]);
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
    if (type === SINGLE_VERSE) {
      setShowRangeOfVerses(false);
    } else {
      onRangeOfVersesTypeSelected();
    }
  };

  const onCopyTextClicked = () => {
    // if a range is selected, we need to validate it first
    if (showRangeOfVerses) {
      const validationError = validateRangeSelection(rangeStartVerse, rangeEndVerse);
      // if the validation fails
      if (validationError) {
        setCustomMessage(validationError);
        return;
      }
    }
    // by default the from and to will be the current verse.
    let fromVerse = verse.verseKey;
    let toVerse = verse.verseKey;
    // if range of verse was selected
    if (showRangeOfVerses) {
      fromVerse = rangeStartVerse;
      toVerse = rangeEndVerse;
    }
    // filter the translations
    const toBeCopiedTranslations = Object.keys(translations).filter(
      (translationId) => translations[translationId].shouldBeCopied === true,
    );
    getAdvancedCopyRawResult({
      raw: true,
      from: fromVerse,
      to: toVerse,
      footnote: shouldCopyFootnotes,
      ...(toBeCopiedTranslations.length > 0 && { translations: toBeCopiedTranslations.join(', ') }), // only include the translations when at least 1 translation has been selected.
      ...(shouldCopyText && { fields: QuranFont.Uthmani }), // only include the Quranic text if the user chose to.
    }).then((response) => {
      // if there is an error
      if (response.status === 500) {
        setCustomMessage('Something went wrong, please try again!');
      } else {
        clipboardCopy(response.result).then(() => {
          const objectUrl = window.URL.createObjectURL(
            new Blob([response.result], { type: 'text/plain' }),
          );
          setIsCopied(true);
          setCustomMessage(
            <p>
              Text is copied successfully in your clipboard.{' '}
              <Link href={objectUrl} download="quran.copy.txt" variant={LinkVariant.Highlight}>
                Click here
              </Link>{' '}
              if you want to download text file.
            </p>,
          );
        });
      }
    });
  };

  const onShouldCopyTextChange = () => {
    setShouldCopyText((prevShouldCopyText) => !prevShouldCopyText);
  };

  /**
   * Handle when the should copy footnote radio changes.
   *
   * @param {string} shouldCopyString
   */
  const onShouldCopyFootnoteChange = (shouldCopyString: string) => {
    setShouldCopyFootnotes(shouldCopyString === TRUE_STRING);
  };

  /**
   * Handle when a translationId is checked/unchecked.
   *
   * @param {string} translationId
   * @returns {void}
   */
  const onCopyTranslationChange = (translationId: string): void => {
    setTranslations((prevTranslations) => ({
      ...prevTranslations,
      [translationId]: {
        ...prevTranslations[translationId],
        shouldBeCopied: !prevTranslations[translationId].shouldBeCopied,
      },
    }));
  };

  const ayahSelectionComponent = (
    <>
      <p className={styles.label}>Select ayah range</p>
      <RadioGroup
        label="Select verses range"
        orientation={RadioGroupOrientation.Horizontal}
        onChange={onRangeTypeChange}
        value={showRangeOfVerses ? MULTIPLE_VERSES : SINGLE_VERSE}
        items={[
          {
            value: SINGLE_VERSE,
            id: SINGLE_VERSE,
            label: `Current verse ${verse.verseKey}`,
          },
          {
            value: MULTIPLE_VERSES,
            id: MULTIPLE_VERSES,
            label: 'Range of verses',
          },
        ]}
      />
      {rangeStartVerse !== null && (
        <VersesRangeSelector
          isVisible={showRangeOfVerses}
          dropdownItems={rangeVersesItems}
          rangeStartVerse={rangeStartVerse}
          rangeEndVerse={rangeEndVerse}
          onChange={onRangeBoundariesChange}
        />
      )}
      <p className={styles.label}>What do you want to copy?</p>
      <Checkbox
        onChange={onShouldCopyTextChange}
        checked={shouldCopyText}
        id="quranText"
        label="Arabic text (Uthmani text)"
      />
      {selectedTranslations.length !== 0 && (
        <>
          <p className={styles.label}>Translations:</p>
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
        </>
      )}
      <p className={styles.label}>Also copy Footnote(s)?</p>
      <RadioGroup
        label="Should copy footnotes"
        value={shouldCopyFootnotes ? TRUE_STRING : FALSE_STRING}
        onChange={onShouldCopyFootnoteChange}
        items={[
          {
            value: FALSE_STRING,
            id: FALSE_STRING,
            label: 'No',
          },
          {
            value: TRUE_STRING,
            id: TRUE_STRING,
            label: 'Yes',
          },
        ]}
      />
      {customMessageComponent && (
        <div className={styles.customMessage}>{customMessageComponent}</div>
      )}
    </>
  );

  const actionText = isCopied ? 'Copied to clipboard' : 'Copy';

  return children({
    ayahSelectionComponent,
    actionText,
    onCopy: onCopyTextClicked,
  });
};

export default VerseAdvancedCopy;
