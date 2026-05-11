import React, { useRef, useCallback, ReactNode } from 'react';

import { FontSizeType } from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import StudyModeControlsHeader from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeControlsHeader';

import styles from './SyntaxTabLayout.module.scss';

interface SyntaxTabLayoutProps {
  selectionControl: ReactNode;
  body: ReactNode;
  fontType?: FontSizeType;
}

/**
 * Layout for Syntax (grammar analytics) content in Study Mode — mirrors StudyModeTabLayout pattern.
 */
const SyntaxTabLayout: React.FC<SyntaxTabLayoutProps> = ({
  selectionControl,
  body,
  fontType = 'tafsir',
}) => {
  return (
    <div className={styles.content}>
      <StudyModeControlsHeader languageSelector={selectionControl} fontType={fontType} />
      <div className={styles.bodyContainer}>{body}</div>
    </div>
  );
};

export default SyntaxTabLayout;

export const useSyntaxTabScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { containerRef, scrollToTop };
};

export { styles as syntaxTabStyles };
