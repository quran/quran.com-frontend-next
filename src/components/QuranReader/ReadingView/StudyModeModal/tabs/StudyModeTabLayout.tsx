import React, { useRef, useCallback, ReactNode } from 'react';

import { FontSizeType } from '../FontSizeControl';
import StudyModeControlsHeader from '../StudyModeControlsHeader';

import styles from './StudyModeTabLayout.module.scss';

export interface StudyModeTabRenderProps {
  scrollToTop: () => void;
}

interface StudyModeTabLayoutProps {
  selectionControl: ReactNode;
  body: ReactNode;
  fontType?: FontSizeType;
}

/**
 * Shared layout component for Study Mode tabs (Tafsir, Reflections, Lessons).
 * Provides consistent container, header with FontSizeControl, and body layout.
 *
 * @returns {React.ReactElement} The tab layout component
 */
const StudyModeTabLayout: React.FC<StudyModeTabLayoutProps> = ({
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

export default StudyModeTabLayout;

/**
 * Custom hook for Study Mode tab scroll behavior.
 * Returns a container ref and scrollToTop callback for consistent scroll handling.
 *
 * @returns {{ containerRef: React.RefObject<HTMLDivElement>, scrollToTop: () => void }} Object containing containerRef and scrollToTop function
 */
export const useStudyModeTabScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { containerRef, scrollToTop };
};

export { styles as studyModeTabStyles };
