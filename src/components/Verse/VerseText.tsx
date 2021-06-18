import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import WordType from 'types/WordType';
import { selectReadingView } from 'src/redux/slices/QuranReader/readingView';
import QuranWord from '../dls/QuranWord/QuranWord';
import { selectQuranReaderStyles, QuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { QuranFont, ReadingView } from '../QuranReader/types';

type VerseTextProps = {
  words: WordType[];
};

const VerseText = ({ words }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const readingView = useSelector(selectReadingView);
  const isQuranPage = readingView === ReadingView.QuranPage;
  const isUthmaniText = quranReaderStyles.quranFont === QuranFont.Uthmani;
  const isFirstTwoPages = words[0].pageNumber <= 2; // We don't want to justify the text on the first 2 pages to resemble the madani mushaf

  return (
    <StyledVerseTextContainer
      styles={quranReaderStyles}
      isQuranPage={isQuranPage}
      isUthmaniText={isUthmaniText}
      isFirstTwoPages={isFirstTwoPages}
    >
      <StyledVerseText styles={quranReaderStyles}>
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
  isUthmaniText: boolean;
  isFirstTwoPages: boolean;
}>`
  display: inline-block;
  direction: rtl;
  font-size: ${(props) => props.styles.quranTextFontSize}rem;
  letter-spacing: ${(props) => props.styles.quranTextLetterSpacing}rem;

  ${(props) =>
    props.isQuranPage &&
    !props.isUthmaniText &&
    !props.isFirstTwoPages &&
    `
  min-width: min(95%, calc(${props.styles.letterSpacingMultiplier} * ${props.styles.quranTextFontSize}rem));
  `}
`;

const StyledVerseText = styled.div<{ styles: QuranReaderStyles }>`
  line-height: ${(props) => props.styles.quranTextLineHeight}rem;
  line-break: anywhere;
  display: flex;
  justify-content: space-between;
`;

export default React.memo(VerseText);
