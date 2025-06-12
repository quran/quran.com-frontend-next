import React from 'react';

import styles from '../ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';

interface ChapterIconProps {
  chapterId: string;
}

/**
 * ChapterIcon component displays the chapter icon with mega size
 * @param {ChapterIconProps} props - Component props
 * @returns {JSX.Element} The ChapterIcon component
 */
const ChapterIcon: React.FC<ChapterIconProps> = ({ chapterId }) => (
  <div className={styles.header}>
    <div className={styles.chapterIconContainer}>
      <ChapterIconContainer chapterId={chapterId} size={ChapterIconsSize.Mega} />
    </div>
  </div>
);

export default ChapterIcon;
