import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import VerseType from '../../../types/VerseType';
import QuranWord from '../dls/QuranWord/QuranWord';
import { selectQuranReaderStyles, QuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { QuranFont } from './types';

type VerseTextProps = {
  verse: VerseType;
  fontStyle?: QuranFont;
};

const VerseText = ({ verse }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  return (
    <StyledVerseTextContainer styles={quranReaderStyles}>
      <StyledVerseText styles={quranReaderStyles}>
        {verse.words?.map((word) => (
          <QuranWord
            key={[word.position, word.code, word.lineNum].join('-')}
            word={word}
            fontStyle={quranReaderStyles.quranFont}
          />
        ))}
      </StyledVerseText>
    </StyledVerseTextContainer>
  );
};

const StyledVerseText = styled.div<{ styles: QuranReaderStyles }>`
  line-height: ${(props) => props.styles.quranTextLineHeight}rem;
  line-break: anywhere;
`;

const StyledVerseTextContainer = styled.div<{ styles: QuranReaderStyles }>`
  display: inline-block;
  direction: rtl;
  font-size: ${(props) => props.styles.quranTextFontSize}rem;
  letter-spacing: ${(props) => props.styles.quranTextLetterSpacing}rem;
`;

export default VerseText;
