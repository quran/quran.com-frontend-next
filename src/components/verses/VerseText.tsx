import React from 'react';
import VerseType from '../../../types/VerseType';
import QuranWord from '../dls/QuranWord/QuranWord';

type VerseTextProps = {
  verse: VerseType;
};

const VerseText = ({ verse }: VerseTextProps) => (
  <>
    {verse.words?.map((word) => (
      <QuranWord
        key={[word.position, word.code, word.lineNum].join('-')}
        word={word}
        tooltip="translation"
      />
    ))}
  </>
);

export default VerseText;
