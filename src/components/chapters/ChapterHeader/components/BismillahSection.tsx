import React from 'react';

import styles from '../ChapterHeader.module.scss';

import Bismillah from '@/dls/Bismillah/Bismillah';

interface BismillahSectionProps {
  chapterId: string;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

/**
 * BismillahSection component displays Bismillah if the chapter should include it
 * @param {BismillahSectionProps} props - Component props
 * @returns {JSX.Element} The BismillahSection component
 */
const BismillahSection: React.FC<BismillahSectionProps> = ({ chapterId }) => (
  <div className={styles.bismillahContainer}>
    {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && <Bismillah />}
  </div>
);

export default BismillahSection;
