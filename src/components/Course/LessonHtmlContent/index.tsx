import React, { useMemo, useState } from 'react';

import styles from './LessonHtmlContent.module.scss';
import VerseChunkWidget from './VerseChunkWidget';

import { FlashCardCarousel, FlashCardDeck, FlashCardList } from '@/components/Course/FlashCards';
import { FlashCardVariant } from '@/components/Course/FlashCards/types';
import HtmlContent from '@/components/RichText/HtmlContent';
import parseFlashcardsFromHtml from '@/utils/flashcardParser';
import { ContentChunk, parseContentChunks } from '@/utils/lessonContentParser';

const VARIANT_CONFIG = {
  [FlashCardVariant.List]: {
    subtitle: 'Tap to expand, mark words as mastered',
  },
  [FlashCardVariant.Carousel]: {
    subtitle: 'Swipe through cards, tap to flip',
  },
  [FlashCardVariant.Deck]: {
    subtitle: 'Swipe right if you know it, left to review',
  },
};

type Props = {
  content: string;
  language: string;
};

const renderChunks = (chunks: ContentChunk[], keyPrefix = '') =>
  chunks.map((chunk) =>
    chunk.type === 'html' ? (
      <HtmlContent key={`${keyPrefix}${chunk.key}`} html={chunk.content} />
    ) : (
      <VerseChunkWidget
        key={`${keyPrefix}${chunk.key}`}
        reference={chunk.reference}
        fallbackHtml={chunk.originalHtml}
      />
    ),
  );

const renderHtml = (html: string, keyPrefix = '') =>
  renderChunks(parseContentChunks(html), keyPrefix);

const toggleInSet = (set: Set<string>, item: string) => {
  const nextSet = new Set(set);
  if (nextSet.has(item)) nextSet.delete(item);
  else nextSet.add(item);
  return nextSet;
};

const LessonHtmlContent: React.FC<Props> = ({ content, language }) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const flashcardData = useMemo(
    () => (language === 'en' ? parseFlashcardsFromHtml(content) : null),
    [content, language],
  );

  if (language !== 'en') return <HtmlContent html={content} />;
  if (flashcardData) {
    const { subtitle } = VARIANT_CONFIG[flashcardData.variant];
    const isListVariant = flashcardData.variant === FlashCardVariant.List;
    const allExpanded =
      flashcardData.flashcards.length > 0 && expandedCards.size === flashcardData.flashcards.length;
    const NonListFlashCardComponent =
      flashcardData.variant === FlashCardVariant.Carousel ? FlashCardCarousel : FlashCardDeck;

    return (
      <div className={styles.container}>
        {flashcardData.beforeHtml && renderHtml(flashcardData.beforeHtml, 'before-')}
        <div className={styles.flashcardSection}>
          <div className={styles.flashcardHeader}>
            <div className={styles.flashcardHeaderText}>
              <h4 className={styles.flashcardTitle}>{flashcardData.headingText}</h4>
              <span className={styles.flashcardSubtitle}>{subtitle}</span>
            </div>
            {isListVariant && (
              <div className={styles.flashcardHeaderActions}>
                <span className={styles.flashcardProgress}>
                  {`${masteredCards.size} / ${flashcardData.flashcards.length} mastered`}
                </span>
                <button
                  type="button"
                  className={styles.flashcardHeaderButton}
                  onClick={() =>
                    setExpandedCards(
                      allExpanded ? new Set() : new Set(flashcardData.flashcards.map((c) => c.id)),
                    )
                  }
                >
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            )}
          </div>
          {isListVariant ? (
            <FlashCardList
              key={content}
              cards={flashcardData.flashcards}
              expandedCards={expandedCards}
              masteredCards={masteredCards}
              onToggleExpand={(cardId) => setExpandedCards((prev) => toggleInSet(prev, cardId))}
              onToggleMastered={(cardId) => setMasteredCards((prev) => toggleInSet(prev, cardId))}
            />
          ) : (
            <NonListFlashCardComponent key={content} cards={flashcardData.flashcards} />
          )}
        </div>
        {flashcardData.afterHtml && renderHtml(flashcardData.afterHtml, 'after-')}
      </div>
    );
  }

  const chunks = parseContentChunks(content);
  return chunks.every((chunk) => chunk.type === 'html') ? (
    <HtmlContent html={content} />
  ) : (
    <div className={styles.container}>{renderChunks(chunks)}</div>
  );
};

export default LessonHtmlContent;
