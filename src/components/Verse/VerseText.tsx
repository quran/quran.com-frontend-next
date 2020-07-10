import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import QuranWord from '../dls/QuranWord/QuranWord';

type VerseTextProps = {
  verse: VerseType;
  fontStyle?: 'uthmani' | 'madani' | 'indopak';
};

const VerseText = ({ verse, fontStyle }: VerseTextProps) => (
  <StyledVerseText>
    {verse.words?.map((word) => (
      <QuranWord
        key={[word.position, word.code, word.lineNum].join('-')}
        word={word}
        fontStyle={fontStyle}
      />
    ))}
  </StyledVerseText>
);

const StyledVerseText = styled.div`
  display: inline-block;
`;

export default VerseText;
