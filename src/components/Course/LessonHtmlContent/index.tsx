import React, { useMemo } from 'react';

import styles from './LessonHtmlContent.module.scss';
import VerseChunkWidget from './VerseChunkWidget';

import HtmlContent from '@/components/RichText/HtmlContent';
import { parseContentChunks } from '@/utils/lessonContentParser';

type Props = {
  content: string;
  language: string;
};

const LessonHtmlContent: React.FC<Props> = ({ content, language }) => {
  const chunks = useMemo(() => {
    // Only process English lessons
    if (language !== 'en') return null;
    return parseContentChunks(content);
  }, [content, language]);

  // Non-English or no chunks: render plain HTML
  if (!chunks) return <HtmlContent html={content} />;

  // If all chunks are HTML (no verses found), render plain content
  if (chunks.every((chunk) => chunk.type === 'html')) return <HtmlContent html={content} />;

  return (
    <div className={styles.container}>
      {chunks.map((chunk, index) =>
        chunk.type === 'html' ? (
          // eslint-disable-next-line react/no-array-index-key
          <HtmlContent key={index} html={chunk.content} />
        ) : (
          <VerseChunkWidget
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            reference={chunk.reference}
            fallbackHtml={chunk.originalHtml}
          />
        ),
      )}
    </div>
  );
};

export default LessonHtmlContent;
