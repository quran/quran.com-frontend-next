import React from 'react';
import ChapterBlock from './ChapterBlock';
import Chapter from '../../../types/Chapter';
import styles from './ChapterList.module.scss';

type Props = {
  chapters: Chapter[];
};

const ChaptersList: React.FC<Props> = ({ chapters }: Props) => (
  <div className={styles.container}>
    {chapters.map((chapter) => (
      <ChapterBlock key={chapter.id} chapter={chapter} />
    ))}
  </div>
);

export default ChaptersList;
