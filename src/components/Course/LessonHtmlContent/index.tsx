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
    if (language !== 'en') return null;
    return parseContentChunks(content);
  }, [content, language]);

  if (!chunks) return <HtmlContent html={content} />;

  if (chunks.every((chunk) => chunk.type === 'html')) return <HtmlContent html={content} />;

  return (
    <div className={styles.container}>
      {chunks.map((chunk) =>
        chunk.type === 'html' ? (
          <HtmlContent key={chunk.key} html={chunk.content} />
        ) : (
          <VerseChunkWidget
            key={chunk.key}
            reference={chunk.reference}
            fallbackHtml={chunk.originalHtml}
          />
        ),
      )}
    </div>
  );
};

export default LessonHtmlContent;
