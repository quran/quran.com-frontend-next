import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import Verse from 'types/Verse';
import {
  selectTranslations,
  TranslationsSettings,
} from 'src/redux/slices/QuranReader/translations';
import useTranslation from 'next-translate/useTranslation';
import { getVerseNumberFromKey, generateChapterVersesKeys } from 'src/utils/verse';
import { getAdvancedCopyRawResult, getTranslationsInfo } from 'src/api';
import { QuranFont } from 'src/components/QuranReader/types';
import RadioButton from '../../dls/Forms/RadioButton/RadioButton';
import Button, { ButtonSize } from '../../dls/Button/Button';
import Checkbox from '../../dls/Forms/Checkbox/Checkbox';
import VersesRangeSelector, { RangeSelectorType, RangeVerseItem } from './VersesRangeSelector';
import styles from './VerseAdvancedCopy.module.scss';

interface Props {
  verse: Verse;
}
const RESET_BUTTON_TIMEOUT_MS = 3 * 1000;

/**
 * Validate the selected range start and end verse keys. The selection will be invalid in the following cases:
 *
 * 1. The range start and end verses are the same which is not a valid range. The user should have selected current verse option instead.
 * 2. The range end verse is before the range start verse e.g. from verse 6 -> verse 4.
 *
 * @param {string} selectedRangeStartVerseKey
 * @param {string} selectedRangeEndVerseKey
 * @returns {string|null} if it's null it means the validation passed.
 */
const validateRangeSelection = (
  selectedRangeStartVerseKey: string,
  selectedRangeEndVerseKey: string,
): string | null => {
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

const VerseAdvancedCopy: React.FC<Props> = ({ verse }) => {
  const { lang } = useTranslation();
  const router = useRouter();
  const { chapterId } = router.query;
  const { selectedTranslations } = useSelector(selectTranslations) as TranslationsSettings;
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
  const [customMessage, setCustomMessage] = useState(null);
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

  useEffect(() => {
    // only fetch when there is at least one translation.
    if (selectedTranslations.length) {
      getTranslationsInfo(lang, selectedTranslations).then((response) => {
        // if there is no error
        if (response.status !== 500) {
          const responseTranslations = {};
          response.translations.forEach((translation) => {
            responseTranslations[translation.id] = {
              shouldBeCopied: false, // the default is to not copy the translation
              name: translation.translatedName.name,
            };
          });
          setTranslations(responseTranslations);
        }
      });
    }
  }, [lang, selectedTranslations]);

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
              <a href={objectUrl} download="quran.copy.txt">
                Click here
              </a>{' '}
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

  return (
    <>
      <p className={styles.label}>Select ayah range</p>
      <div className={styles.rangeTypeSelectorContainer}>
        <RadioButton
          checked={!showRangeOfVerses}
          id="single"
          label={`Current verse ${verse.verseKey}`}
          name="single"
          onChange={() => setShowRangeOfVerses(false)}
          value="single"
        />
        <RadioButton
          checked={showRangeOfVerses}
          id="multiple"
          label="Range of verses"
          name="multiple"
          onChange={onRangeOfVersesTypeSelected}
          value="multiple"
        />
      </div>
      {rangeStartVerse && (
        <VersesRangeSelector
          isVisible={showRangeOfVerses}
          dropdownItems={rangeVersesItems}
          rangeStartVerse={rangeStartVerse}
          rangeEndVerse={rangeEndVerse}
          onSelect={onRangeBoundariesChange}
        />
      )}
      <p className={styles.label}>What do you want to copy?</p>
      <Checkbox
        onChange={onShouldCopyTextChange}
        checked={shouldCopyText}
        id="quranText"
        label="Arabic text (Uthmani text)"
      />
      {Object.keys(translations).length !== 0 && (
        <>
          <p className={styles.label}>Translations:</p>
          {Object.keys(translations).map((translationId) => (
            <Checkbox
              key={translationId}
              onChange={() => onCopyTranslationChange(translationId)}
              checked={translations[translationId].shouldBeCopied}
              id={translationId}
              label={translations[translationId].name}
            />
          ))}
        </>
      )}
      <p className={styles.label}>Also copy Footnote(s)?</p>
      <RadioButton
        checked={!shouldCopyFootnotes}
        id="No"
        label="No"
        name="No"
        onChange={() => setShouldCopyFootnotes(false)}
        value="No"
      />
      <RadioButton
        checked={shouldCopyFootnotes}
        id="Yes"
        label="Yes"
        name="Yes"
        onChange={() => setShouldCopyFootnotes(true)}
        value="Yes"
      />
      {customMessage && <div className={styles.customMessage}>{customMessage}</div>}
      <div className={styles.buttonContainer}>
        <Button
          text={isCopied ? 'Copied!' : 'Copy'}
          onClick={onCopyTextClicked}
          size={ButtonSize.Large}
        />
      </div>
    </>
  );
};

export default VerseAdvancedCopy;
