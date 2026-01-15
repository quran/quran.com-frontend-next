/* eslint-disable react/no-danger */
import React, { useCallback, useState, MouseEvent } from 'react';

import classNames from 'classnames';

import InlineFootnote from './InlineFootnote';
import styles from './TranslatedAyah.module.scss';

import { logErrorToSentry } from '@/lib/sentry';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageDataById, findLanguageIdByLocale } from '@/utils/locale';
import { getFootnote } from 'src/api';
import Footnote from 'types/Footnote';
import Language from 'types/Language';

type TranslatedAyahProps = {
  verseKey: string;
  verseNumber: number;
  translationHtml: string;
  languageId: number;
  lang: string;
  isLastVerse?: boolean;
  onAyahClick?: (verseKey: string) => void;
};

/**
 * Renders a single translated ayah with hover highlight, click interactions, and footnote support.
 *
 * @returns {JSX.Element} The translated ayah component
 */
const TranslatedAyah: React.FC<TranslatedAyahProps> = ({
  verseKey,
  verseNumber,
  translationHtml,
  languageId,
  lang,
  isLastVerse = false,
  onAyahClick,
}) => {
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const [activeFootnoteName, setActiveFootnoteName] = useState<string | null>(null);
  const [isLoadingFootnote, setIsLoadingFootnote] = useState(false);

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

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SUP') {
        event.stopPropagation();
        handleFootnoteClick(target);
        return;
      }
      if (onAyahClick) onAyahClick(verseKey);
    },
    [onAyahClick, verseKey, handleFootnoteClick],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && onAyahClick) {
        event.preventDefault();
        onAyahClick(verseKey);
      }
    },
    [onAyahClick, verseKey],
  );

  const showFootnote = footnote !== null || isLoadingFootnote;

  return (
    <>
      <span
        className={classNames(styles.ayah, styles[langData.direction], {
          [styles.clickable]: !!onAyahClick,
          [styles.hasActiveFootnote]: showFootnote,
        })}
        data-verse-key={verseKey}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <span className={styles.verseNumber}>{verseNumber}.</span>
        <span
          className={styles.translationText}
          dangerouslySetInnerHTML={{ __html: translationHtml }}
        />
        {!isLastVerse && !showFootnote && ' '}
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
