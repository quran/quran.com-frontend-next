import React, { useMemo } from 'react';

import styles from './LessonHtmlContent.module.scss';
import VerseChunkWidget from './VerseChunkWidget';

import { FlashCardCarousel, FlashCardDeck, FlashCardList } from '@/components/Course/FlashCards';
import { FlashCardVariant } from '@/components/Course/FlashCards/types';
import HtmlContent from '@/components/RichText/HtmlContent';
import parseFlashcardsFromHtml from '@/utils/flashcardParser';
import { ContentChunk, parseContentChunks } from '@/utils/lessonContentParser';

const VARIANT_CONFIG = {
  [FlashCardVariant.List]: {
    component: FlashCardList,
    subtitle: 'Tap to expand, mark words as mastered',
  },
  [FlashCardVariant.Carousel]: {
    component: FlashCardCarousel,
    subtitle: 'Swipe through cards, tap to flip',
  },
  [FlashCardVariant.Deck]: {
    component: FlashCardDeck,
    subtitle: 'Swipe right if you know it, left to review',
  },
};
const FLASHCARD_TITLE = 'Word-by-word breakdown';

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

const LessonHtmlContent: React.FC<Props> = ({ content, language }) => {
  const flashcardData = useMemo(
    () => (language === 'en' ? parseFlashcardsFromHtml(content) : null),
    [content, language],
  );
  if (language !== 'en') return <HtmlContent html={content} />;
  if (flashcardData) {
    const { component: FlashCardComponent, subtitle } = VARIANT_CONFIG[flashcardData.variant];

    return (
      <div className={styles.container}>
        {flashcardData.beforeHtml && renderHtml(flashcardData.beforeHtml, 'before-')}
        <div className={styles.flashcardSection}>
          <div className={styles.flashcardHeader}>
            <h4 className={styles.flashcardTitle}>{FLASHCARD_TITLE}</h4>
            <span className={styles.flashcardSubtitle}>{subtitle}</span>
          </div>
          <FlashCardComponent key={content} cards={flashcardData.flashcards} />
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
