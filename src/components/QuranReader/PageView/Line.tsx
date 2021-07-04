import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectQuranReaderStyles, QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Word from 'types/WordType';
import VerseText from 'src/components/Verse/VerseText';

type LineProps = {
  words: Word[];
};

const Line = ({ words }: LineProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { lineNumber } = words[0];

  return (
    <StyledLineContainer styles={quranReaderStyles} id={`line-${lineNumber}`}>
      <StyledLine styles={quranReaderStyles}>
        <VerseText words={words} />
      </StyledLine>
    </StyledLineContainer>
  );
};

const StyledLine = styled.div<{ styles: QuranReaderStyles }>`
  text-align: center;
`;

const StyledLineContainer = styled.div<{ styles: QuranReaderStyles }>`
  display: block;
  direction: rtl;
  /* TODO (@abdellatif): make the vw dimension adaptive */
  font-size: min(5vw, ${(props) => props.styles.quranTextFontSize}rem);
`;

export default React.memo(Line);
