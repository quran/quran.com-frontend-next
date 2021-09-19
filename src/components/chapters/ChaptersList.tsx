import React from 'react';

import ChapterBlock from './ChapterBlock';
import styles from './ChaptersList.module.scss';

import Chapter from 'types/Chapter';

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
