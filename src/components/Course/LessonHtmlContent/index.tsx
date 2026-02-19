import React, { useMemo, useState } from 'react';

import styles from './LessonHtmlContent.module.scss';
import VerseChunkWidget from './VerseChunkWidget';

import { FlashCardCarousel, FlashCardDeck, FlashCardList } from '@/components/Course/FlashCards';
import { FlashCardVariant } from '@/components/Course/FlashCards/types';
import LessonQuiz from '@/components/Course/LessonQuiz';
import HtmlContent from '@/components/RichText/HtmlContent';
import parseFlashcardsFromHtml from '@/utils/flashcardParser';
import { ContentChunk, parseContentChunks } from '@/utils/lessonContentParser';
import parseLessonQuizFromHtml from '@/utils/lessonQuizParser';

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
  lessonSlug: string;
  courseSlug: string;
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

const LessonHtmlContent: React.FC<Props> = ({ content, language, lessonSlug, courseSlug }) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  const isInteractiveLearningPlan =
    courseSlug === '30-transformative-days-with-surah-al-mulk-learn-reflect-memorize';
  const shouldUseInteractiveFeatures = language === 'en' && isInteractiveLearningPlan;

  const parsedLessonQuiz = useMemo(
    () => (shouldUseInteractiveFeatures ? parseLessonQuizFromHtml(content) : null),
    [content, shouldUseInteractiveFeatures],
  );
  const contentToRender = parsedLessonQuiz?.contentWithoutQuizSection ?? content;
  const quizNode = parsedLessonQuiz ? (
    <LessonQuiz
      lessonSlug={lessonSlug}
      title={parsedLessonQuiz.headingText}
      question={parsedLessonQuiz.question}
    />
  ) : null;
  const flashcardData = useMemo(
    () => (shouldUseInteractiveFeatures ? parseFlashcardsFromHtml(contentToRender) : null),
    [contentToRender, shouldUseInteractiveFeatures],
  );

  if (!shouldUseInteractiveFeatures) {
    return <HtmlContent html={content} />;
  }

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
              key={contentToRender}
              cards={flashcardData.flashcards}
              expandedCards={expandedCards}
              masteredCards={masteredCards}
              onToggleExpand={(cardId) => setExpandedCards((prev) => toggleInSet(prev, cardId))}
              onToggleMastered={(cardId) => setMasteredCards((prev) => toggleInSet(prev, cardId))}
            />
          ) : (
            <NonListFlashCardComponent key={contentToRender} cards={flashcardData.flashcards} />
          )}
        </div>
        {flashcardData.afterHtml && renderHtml(flashcardData.afterHtml, 'after-')}
        {quizNode}
      </div>
    );
  }

  const chunks = parseContentChunks(contentToRender);
  if (chunks.every((chunk) => chunk.type === 'html')) {
    if (!quizNode) return <HtmlContent html={contentToRender} />;
    return (
      <div className={styles.container}>
        <HtmlContent html={contentToRender} />
        {quizNode}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {renderChunks(chunks)}
      {quizNode}
    </div>
  );
};

export default LessonHtmlContent;
