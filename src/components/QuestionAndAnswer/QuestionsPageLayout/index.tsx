import React, { ReactNode } from 'react';

import classNames from 'classnames';

import styles from './QuestionsPageLayout.module.scss';

import GroupedVerseAndTranslation from '@/components/Verse/GroupedVerseAndTranslation';
import Separator from '@/dls/Separator/Separator';

interface QuestionsPageLayoutProps {
  chapterId: string;
  verseNumber: string;
  children: ReactNode;
  fontScale?: number;
  showVerse?: boolean;
}

/**
 * Shared layout component for Q&A pages that provides consistent structure
 * similar to the modal layout, with verse display at the top and Q&A content below.
 *
 * @param {QuestionsPageLayoutProps} props - Component props
 * @param {string} props.chapterId - The chapter ID for the verse
 * @param {string} props.verseNumber - The verse number
 * @param {ReactNode} props.children - The Q&A content to display
 * @param {number} [props.fontScale=2] - Optional font scale (1-10) for Q&A content
 * @param {boolean} [props.showVerse=true] - Whether to show the verse at the top
 * @returns {React.ReactElement} The Q&A page layout component
 */
const QuestionsPageLayout: React.FC<QuestionsPageLayoutProps> = ({
  chapterId,
  verseNumber,
  children,
  fontScale = 2,
  showVerse = true,
}) => {
  const scaleClass = styles[`qna-font-size-${fontScale}`];

  return (
    <div className={classNames(styles.container, scaleClass)}>
      {showVerse && (
        <>
          <div className={styles.verseSection}>
            <GroupedVerseAndTranslation
              from={Number(verseNumber)}
              to={Number(verseNumber)}
              chapter={Number(chapterId)}
            />
          </div>

          <div className={styles.separatorContainer}>
            <Separator />
          </div>
        </>
      )}

      <div className={styles.contentSection}>{children}</div>
    </div>
  );
};

export default QuestionsPageLayout;
