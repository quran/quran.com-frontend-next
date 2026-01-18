/* eslint-disable max-lines -- Component handles ayah interactions, footnotes, and mobile/desktop rendering */
/* eslint-disable react/no-danger -- Translation HTML from trusted backend API contains necessary formatting */
import React, { useCallback, useState, MouseEvent } from 'react';

import classNames from 'classnames';

import InlineFootnote from './InlineFootnote';
import styles from './TranslatedAyah.module.scss';
import WordMobileModal from './WordMobileModal';
import ReadingViewWordPopover from './WordPopover';

import useIsMobile from '@/hooks/useIsMobile';
import { logErrorToSentry } from '@/lib/sentry';
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
  bookmarksRangeUrl?: string | null;
};

/**
 * Renders a single translated ayah with hover highlight, click interactions, and footnote support.
 * On desktop: shows a popover with verse actions on click
 * On mobile: shows a bottom sheet modal with verse actions on click
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
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isMobile = useIsMobile();
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

  // Handle mobile click - open the modal
  const handleMobileClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const supElement = target.closest('sup');
      if (supElement) {
        event.stopPropagation();
        handleFootnoteClick(supElement as HTMLElement);
        return;
      }
      logButtonClick('reading_translation_ayah_click', { verseKey: verse.verseKey });
      setIsMobileModalOpen(true);
    },
    [handleFootnoteClick, verse.verseKey],
  );

  const handleMobileKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsMobileModalOpen(true);
    }
  }, []);

  const showFootnote = footnote !== null || isLoadingFootnote;
  const isActionMenuOpen = isMobileModalOpen || isPopoverOpen;

  // Handle desktop click - open the popover
  const handleDesktopClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const supElement = target.closest('sup');
      if (supElement) {
        event.stopPropagation();
        event.preventDefault();
        handleFootnoteClick(supElement as HTMLElement);
        return;
      }
      logButtonClick('reading_translation_ayah_click', { verseKey: verse.verseKey });
      setIsPopoverOpen(true);
    },
    [handleFootnoteClick, verse.verseKey],
  );

  const handleDesktopKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPopoverOpen(true);
    }
  }, []);

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
      {isMobile ? (
        <>
          <span
            className={classNames(styles.ayah, styles[langData.direction], styles.clickable, {
              [styles.hasActiveFootnote]: showFootnote,
              [styles.isActive]: isActionMenuOpen,
            })}
            data-verse-key={verse.verseKey}
            onClick={handleMobileClick}
            onKeyDown={handleMobileKeyDown}
            role="button"
            tabIndex={0}
          >
            {verseNumberElement}
            {translationTextElement}
          </span>
          <WordMobileModal
            isOpen={isMobileModalOpen}
            onClose={() => setIsMobileModalOpen(false)}
            verse={verse}
            bookmarksRangeUrl={bookmarksRangeUrl}
          />
        </>
      ) : (
        <span
          className={classNames(styles.ayah, styles[langData.direction], styles.clickable, {
            [styles.hasActiveFootnote]: showFootnote,
            [styles.isActive]: isActionMenuOpen,
          })}
          data-verse-key={verse.verseKey}
          onClick={handleDesktopClick}
          onKeyDown={handleDesktopKeyDown}
          role="button"
          tabIndex={0}
        >
          <ReadingViewWordPopover
            verse={verse}
            bookmarksRangeUrl={bookmarksRangeUrl}
            onOpenChange={setIsPopoverOpen}
            isOpen={isPopoverOpen}
          >
            {verseNumberElement}
          </ReadingViewWordPopover>
          {translationTextElement}
        </span>
      )}
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
