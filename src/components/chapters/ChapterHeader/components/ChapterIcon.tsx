import React from 'react';

import styles from '../ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';

interface ChapterIconProps {
  chapterId: string;
  size?: ChapterIconsSize;
}

/**
 * ChapterIcon component displays the chapter icon with mega size
 * @param {ChapterIconProps} props - Component props
 * @returns {JSX.Element} The ChapterIcon component
 */
const ChapterIcon: React.FC<ChapterIconProps> = ({
  chapterId,
  size = ChapterIconsSize.Massive,
}) => (
  <div className={styles.header}>
    <div className={styles.chapterIconContainer}>
      <ChapterIconContainer chapterId={chapterId} size={size} hasSurahPrefix={false} />
    </div>
  </div>
);

export default ChapterIcon;
