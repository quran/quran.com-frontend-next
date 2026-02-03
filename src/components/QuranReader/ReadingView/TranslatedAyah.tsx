/* eslint-disable max-lines -- Component handles ayah interactions, footnotes, and mobile/desktop rendering */
/* eslint-disable react/no-danger -- Translation HTML from trusted backend API contains necessary formatting */
import React, { useCallback, useState, MouseEvent } from 'react';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import InlineFootnote from './InlineFootnote';
import styles from './TranslatedAyah.module.scss';

import { logErrorToSentry } from '@/lib/sentry';
import {
  openStudyMode,
  selectStudyModeIsOpen,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageDataById, findLanguageIdByLocale, toLocalizedNumber } from '@/utils/locale';
import { getFootnote } from 'src/api';
import Footnote from 'types/Footnote';
import Language from 'types/Language';
import Verse from 'types/Verse';

type TranslatedAyahProps = {
  verse: Verse;
  translationHtml: string;
  languageId: number;
  lang: string;
  isLastVerse?: boolean;
};

/**
 * Renders a single translated ayah with hover highlight, click interactions, and footnote support.
 * Opens the StudyModeModal when clicked for verse actions (tafsir, reflections, lessons, etc.)
 *
 * @returns {JSX.Element} The translated ayah component
 */
const TranslatedAyah: React.FC<TranslatedAyahProps> = ({
  verse,
  translationHtml,
  languageId,
  lang,
  isLastVerse = false,
}) => {
  const dispatch = useDispatch();
  const studyModeIsOpen = useSelector(selectStudyModeIsOpen);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const [activeFootnoteName, setActiveFootnoteName] = useState<string | null>(null);
  const [isLoadingFootnote, setIsLoadingFootnote] = useState(false);

  // Check if study mode is open for this specific verse
  const isStudyModeModalOpen = studyModeIsOpen && studyModeVerseKey === verse.verseKey;

  const langData = getLanguageDataById(languageId || findLanguageIdByLocale(lang as Language));

  const resetFootnote = useCallback(() => {
    setFootnote(null);
    setActiveFootnoteName(null);
    setIsLoadingFootnote(false);
  }, []);

  const handleFootnoteClick = useCallback(
    (target: HTMLElement) => {
      const footnoteText = target.innerText.trim();
      const footNoteId = target.getAttribute('foot_note');

      // Only handle footnotes with a foot_note attribute (API-backed footnotes)
      if (!footNoteId) return;

      setActiveFootnoteName(footnoteText);

      const numericId = Number(footNoteId);
      if (footnote && !Number.isNaN(numericId) && footnote.id === numericId) {
        logButtonClick('reading_translation_footnote_close');
        resetFootnote();
      } else {
        logButtonClick('reading_translation_footnote_open');
        setIsLoadingFootnote(true);
        getFootnote(footNoteId)
          .then((res) => {
            if (res?.footNote) {
              setFootnote(res.footNote);
            }
          })
          .catch((error) => {
            logErrorToSentry(error as Error, {
              transactionName: 'TranslatedAyah.handleFootnoteClick',
              metadata: { footNoteId },
            });
            resetFootnote();
          })
          .finally(() => setIsLoadingFootnote(false));
      }
    },
    [footnote, resetFootnote],
  );

  const handleAyahClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const supElement = target.closest('sup');
      if (supElement) {
        event.stopPropagation();
        handleFootnoteClick(supElement as HTMLElement);
        return;
      }
      logButtonClick('study_mode_open_translation_reading', { verseKey: verse.verseKey });
      dispatch(openStudyMode({ verseKey: verse.verseKey }));
    },
    [handleFootnoteClick, verse.verseKey, dispatch],
  );

  const handleAyahKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        logButtonClick('study_mode_open_translation_reading', { verseKey: verse.verseKey });
        dispatch(openStudyMode({ verseKey: verse.verseKey }));
      }
    },
    [dispatch, verse.verseKey],
  );

  const showFootnote = footnote !== null || isLoadingFootnote;

  // Verse number element - used as popover trigger on desktop for consistent positioning
  // Use translation's language (langData.code) for number formatting to show Arabic numerals for RTL translations
  const verseNumberElement = (
    <span className={styles.verseNumber}>
      {toLocalizedNumber(verse.verseNumber, langData.code)}.
    </span>
  );

  // Translation text element
  const translationTextElement = (
    <>
      {/* Safe: translationHtml comes from backend API and contains footnote markup */}
      <span
        className={styles.translationText}
        dangerouslySetInnerHTML={{ __html: translationHtml }}
      />
      {!isLastVerse && !showFootnote && ' '}
    </>
  );

  return (
    <>
      <span
        className={classNames(styles.ayah, styles[langData.direction], styles.clickable, {
          [styles.hasActiveFootnote]: showFootnote,
          [styles.isActive]: isStudyModeModalOpen,
        })}
        data-verse-key={verse.verseKey}
        onClick={handleAyahClick}
        onKeyDown={handleAyahKeyDown}
        role="button"
        tabIndex={0}
      >
        {verseNumberElement}
        {translationTextElement}
      </span>

      {showFootnote && (
        <InlineFootnote
          footnoteName={activeFootnoteName}
          footnoteText={footnote?.text}
          isLoading={isLoadingFootnote}
          direction={langData.direction}
          onClose={resetFootnote}
        />
      )}
      {showFootnote && !isLastVerse && ' '}
    </>
  );
};

export default TranslatedAyah;
