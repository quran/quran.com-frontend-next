import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import VerseType from '../../../types/VerseType';
import QuranWord from '../dls/QuranWord/QuranWord';
import { selectQuranReaderStyles, QuranReaderStyles } from '../../redux/slices/QuranReader/styles';

type VerseTextProps = {
  verse: VerseType;
  fontStyle?: 'uthmani' | 'madani' | 'indopak';
};

const VerseText = ({ verse, fontStyle }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  return (
    <StyledVerseTextContainer styles={quranReaderStyles}>
      <StyledVerseText styles={quranReaderStyles}>
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
};

const StyledVerseText = styled.div<{ styles: QuranReaderStyles }>`
  display: inline-block;
  line-height: ${(props) => props.styles.quranTextLineHeight}rem;
`;

const StyledVerseTextContainer = styled.div<{ styles: QuranReaderStyles }>`
  direction: rtl;
  line-break: anywhere;
  font-size: ${(props) => props.styles.quranTextFontSize}rem;
  letter-spacing: ${(props) => props.styles.quranTextLetterSpacing}rem;
`;

export default VerseText;
