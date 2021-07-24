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

// Lines that need to be center aligned
const CENTER_ALIGNED_PAGE_LINES = {
  '255': [2], // 13(Ar-Ra'd), last ayah
  '528': [9], // 67 (Al Qalam) last ayah
  '534': [6], // 55(Ar-Rahman) last ayah
  '545': [6], // 58(Al-Mujadila) last ayah
  '586': [1], // 80('Abasa) last ayah
  '593': [2], // 88(Al-Ghashiyah) last 2 ayah
  '594': [5], // 89(Al-Fajr) last 2 ayah
  '600': [10], // 100(Al-'Adiyat) last 2 ayah
  '602': [5, 15], // 106(Quraysh) last ayah, 108(Al-Kawthar) last ayah
  '603': [10, 15], // 110(An-Nasr) last ayah, 111(Al-Masad) last ayah
  '604': [4, 9, 14, 15], // 112(Al-Ikhlas) last ayah, 113(Al-Falaq) last ayah, 114(An-Nas) last 2 ayah
};

const VerseText = ({ words }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const readingView = useSelector(selectReadingView);
  const isQuranPage = readingView === ReadingView.QuranPage;
  const { lineNumber, pageNumber } = words[0];
  const centerAlignedLines = CENTER_ALIGNED_PAGE_LINES[pageNumber] || [];

  const centerAlignPage =
    CENTER_ALIGNED_PAGES.includes(pageNumber) || centerAlignedLines.includes(lineNumber);

  return (
    <StyledVerseTextContainer
      quranReaderStyles={quranReaderStyles}
      isQuranPage={isQuranPage}
      centerAlignPage={centerAlignPage}
    >
      <StyledVerseText
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
