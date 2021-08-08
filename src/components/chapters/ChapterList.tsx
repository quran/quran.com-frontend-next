import React from 'react';
import ChapterBlock from './ChapterBlock';
import Chapter from '../../../types/Chapter';

type Props = {
  chapters: Chapter[];
};

const ChaptersList: React.FC<Props> = ({ chapters }: Props) => (
  <ul>
    {chapters.map((chapter) => (
      <ChapterBlock key={chapter.id} chapter={chapter} />
    ))}
  </ul>
);

export default ChaptersList;
