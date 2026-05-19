import React from 'react';

import dynamic from 'next/dynamic';

import SyntaxSkeleton from '@/components/QuranReader/SyntaxView/SyntaxSkeleton';
import {
  useSyntaxTabScroll,
  syntaxTabStyles as styles,
} from '@/components/QuranReader/SyntaxView/SyntaxTabLayout';
import Word from '@/types/Word';

const SyntaxBody = dynamic(() => import('@/components/QuranReader/SyntaxView/SyntaxBody'), {
  loading: SyntaxSkeleton,
});

interface StudyModeSyntaxTabProps {
  chapterId: string;
  verseNumber: string;
  selectedWord?: Word;
}

const StudyModeSyntaxTab: React.FC<StudyModeSyntaxTabProps> = ({
  chapterId,
  verseNumber,
  selectedWord,
}) => {
  const { containerRef, scrollToTop } = useSyntaxTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <SyntaxBody
        chapterId={chapterId}
        verseNumber={verseNumber}
        selectedWord={selectedWord}
        scrollToTop={scrollToTop}
      />
    </div>
  );
};

export default StudyModeSyntaxTab;
