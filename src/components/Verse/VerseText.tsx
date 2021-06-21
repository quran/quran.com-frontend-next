import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import WordType from 'types/WordType';
import { selectReadingView } from 'src/redux/slices/QuranReader/readingView';
import QuranWord from '../dls/QuranWord/QuranWord';
import { selectQuranReaderStyles, QuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { ReadingView } from '../QuranReader/types';

type VerseTextProps = {
  words: WordType[];
};

// Pages where we want to have center align text to resemble the Madani Mushaf
const CENTER_ALIGNED_PAGES = [1, 2];

const VerseText = ({ words }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const readingView = useSelector(selectReadingView);
  const isQuranPage = readingView === ReadingView.QuranPage;
  const centerAlignPage = CENTER_ALIGNED_PAGES.includes(words[0].pageNumber);

  return (
    <StyledVerseTextContainer
      styles={quranReaderStyles}
      isQuranPage={isQuranPage}
      centerAlignPage={centerAlignPage}
    >
      <StyledVerseText styles={quranReaderStyles} centerAlignPage={centerAlignPage}>
        {words?.map((word) => (
          <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
        ))}
      </StyledVerseText>
    </StyledVerseTextContainer>
  );
};

const StyledVerseTextContainer = styled.div<{
  styles: QuranReaderStyles;
  isQuranPage: boolean;
  centerAlignPage: boolean;
}>`
  display: block;
  direction: rtl;
  font-size: ${(props) => props.styles.quranTextFontSize}rem;

  ${(props) =>
    props.isQuranPage &&
    !props.centerAlignPage &&
    `
  min-width: min(95%, calc(${props.styles.letterSpacingMultiplier} * ${props.styles.quranTextFontSize}rem));
  `}
`;

const StyledVerseText = styled.div<{ styles: QuranReaderStyles; centerAlignPage: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.centerAlignPage ? 'center' : 'space-between')};
`;

export default React.memo(VerseText);
