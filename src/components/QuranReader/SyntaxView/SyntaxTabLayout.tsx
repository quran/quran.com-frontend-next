import React, { useRef, useCallback, ReactNode } from 'react';

import styles from './SyntaxTabLayout.module.scss';

import { FontSizeType } from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import StudyModeControlsHeader from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeControlsHeader';

interface SyntaxTabLayoutProps {
  selectionControl: ReactNode;
  body: ReactNode;
  fontType?: FontSizeType;
}

/**
 * Layout for Syntax (grammar analytics) content in Study Mode — mirrors StudyModeTabLayout pattern.
 * @returns {React.ReactElement} Syntax tab chrome with font controls and body slot.
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

/**
 * Scroll container ref + scroll-to-top for Syntax tab content.
 * @returns {{ containerRef: React.RefObject<HTMLDivElement>, scrollToTop: () => void }}
 */
export const useSyntaxTabScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { containerRef, scrollToTop };
};

export { styles as syntaxTabStyles };
