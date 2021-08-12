import React from 'react';
import ChapterIcon from 'src/components/chapters/ChapterIcon';
import styles from './ChapterIconContainer.module.scss';

interface Props {
  chapterId: string;
}

const IconContainer: React.FC<Props> = ({ chapterId }) => (
  <span className={styles.iconContainer}>
    <ChapterIcon id={chapterId} />
    <ChapterIcon />
  </span>
);

export default IconContainer;
