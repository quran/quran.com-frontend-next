/* eslint-disable max-lines -- Component handles ayah interactions, footnotes, and mobile/desktop rendering */
/* eslint-disable react/no-danger -- Translation HTML from trusted backend API contains necessary formatting */
import React, { useCallback, useState, MouseEvent, lazy, Suspense } from 'react';

import classNames from 'classnames';

import InlineFootnote from './InlineFootnote';
import styles from './TranslatedAyah.module.scss';

import { logErrorToSentry } from '@/lib/sentry';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageDataById, findLanguageIdByLocale, toLocalizedNumber } from '@/utils/locale';
import { getFootnote } from 'src/api';
import Footnote from 'types/Footnote';
import Language from 'types/Language';
import Verse from 'types/Verse';

const StudyModeModal = lazy(() => import('./StudyModeModal'));

type TranslatedAyahProps = {
  verse: Verse;
  translationHtml: string;
  languageId: number;
  lang: string;
  isLastVerse?: boolean;
  bookmarksRangeUrl?: string | null;
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
  bookmarksRangeUrl,
}) => {
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const [activeFootnoteName, setActiveFootnoteName] = useState<string | null>(null);
  const [isLoadingFootnote, setIsLoadingFootnote] = useState(false);
  const [isStudyModeModalOpen, setIsStudyModeModalOpen] = useState(false);

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

  // Handle click - open the StudyModeModal
  const handleAyahClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const supElement = target.closest('sup');
      if (supElement) {
        event.stopPropagation();
        handleFootnoteClick(supElement as HTMLElement);
        return;
      }
      logButtonClick('reading_translation_ayah_click', { verseKey: verse.verseKey });
      setIsStudyModeModalOpen(true);
    },
    [handleFootnoteClick, verse.verseKey],
  );

  const handleAyahKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsStudyModeModalOpen(true);
    }
  }, []);

  const showFootnote = footnote !== null || isLoadingFootnote;

  // Verse number element - used as popover trigger on desktop for consistent positioning
  const verseNumberElement = (
    <span className={styles.verseNumber}>{toLocalizedNumber(verse.verseNumber, lang)}.</span>
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

      <Suspense fallback={null}>
        <StudyModeModal
          isOpen={isStudyModeModalOpen}
          onClose={() => setIsStudyModeModalOpen(false)}
          verse={verse}
          verseKey={verse.verseKey}
        />
      </Suspense>

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
