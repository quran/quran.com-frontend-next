import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Word from 'types/Word';
import { selectReadingView } from 'src/redux/slices/QuranReader/readingView';
import QuranWord from '../dls/QuranWord/QuranWord';
import { selectQuranReaderStyles, QuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { ReadingView } from '../QuranReader/types';

type VerseTextProps = {
  words: Word[];
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
      quranReaderStyles={quranReaderStyles}
      isQuranPage={isQuranPage}
      centerAlignPage={centerAlignPage}
    >
      <StyledVerseText
        className="ayah-text"
        quranReaderStyles={quranReaderStyles}
        isQuranPage={isQuranPage}
        centerAlignPage={centerAlignPage}
      >
        {words?.map((word) => (
          <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
        ))}
      </StyledVerseText>
    </StyledVerseTextContainer>
  );
};

const StyledVerseTextContainer = styled.div<{
  quranReaderStyles: QuranReaderStyles;
  isQuranPage: boolean;
  centerAlignPage: boolean;
}>`
  display: block;
  direction: rtl;
  font-size: ${(props) => props.quranReaderStyles.quranTextFontSize}rem;

  ${(props) =>
    props.isQuranPage &&
    !props.centerAlignPage &&
    `
  min-width: min(95%, calc(${props.quranReaderStyles.letterSpacingMultiplier} * ${props.quranReaderStyles.quranTextFontSize}rem));
  `}
`;

const StyledVerseText = styled.div<{
  quranReaderStyles: QuranReaderStyles;
  centerAlignPage: boolean;
  isQuranPage: boolean;
}>`
  flex-wrap: wrap;
  display: flex;
  ${({ isQuranPage, centerAlignPage }) =>
    isQuranPage &&
    `
    justify-content: ${centerAlignPage ? 'center' : 'space-between'};
  `}
`;

export default React.memo(VerseText);
