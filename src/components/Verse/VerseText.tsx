import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import QuranWord from '../dls/QuranWord/QuranWord';

type VerseTextProps = {
  verse: VerseType;
  fontStyle?: 'uthmani' | 'madani' | 'indopak';
};

const VerseText = ({ verse, fontStyle }: VerseTextProps) => (
  <StyledVerseTextContainer>
    <StyledVerseText>
      {verse.words?.map((word) => (
        <QuranWord
          key={[word.position, word.code, word.lineNum].join('-')}
          word={word}
          fontStyle={fontStyle}
        />
      ))}
    </StyledVerseText>
  </StyledVerseTextContainer>
);

const StyledVerseText = styled.div`
  display: inline-block;
  line-height: 3rem; //TODO (@abdellatif): update to use the theme font size
`;

const StyledVerseTextContainer = styled.div`
  direction: rtl;
  line-break: anywhere;
  font-size: 2rem; //TODO (@abdellatif): update to use the theme font size
  letter-spacing: 0.25rem; //TODO (@abdellatif): update to use the theme font size
`;

export default VerseText;
