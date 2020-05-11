import React from 'react';
import Verse from './Verse';
import VerseType from '../../../types/VerseType';
import ChapterType from '../../../types/ChapterType';

type VersesListProps = {
  verses: VerseType[];
  chapter: ChapterType;
};

const VersesList = ({ verses }: VersesListProps) => (
  <>
    {verses.map((verse) => (
      <Verse key={verse.verseKey} verse={verse} />
    ))}
  </>
);

export default VersesList;
