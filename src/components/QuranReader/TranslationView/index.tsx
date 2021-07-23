import React from 'react';
import styled from 'styled-components';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import VerseSettings from 'src/components/Verse/VerseSettings';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => {
  const router = useRouter();
  const {
    query: { chapterId },
  } = router;
  return (
    <StyledTranslationView>
      {verses.map((verse) => (
        <VerseTextContainer highlight={false} key={verse.id}>
          <Link as={`/${chapterId}/${verse.verseNumber}`} href="/[chapterId]/[verseId]" passHref>
            <StyledVerseLink>{verse.verseKey}</StyledVerseLink>
          </Link>
          <VerseSettings verse={verse} />
          <VerseText words={verse.words} />
          {verse.translations?.map((translation: Translation) => (
            <StyledText
              quranReaderStyles={quranReaderStyles}
              key={translation.id}
              dangerouslySetInnerHTML={{ __html: translation.text }}
            />
          ))}
          <hr />
        </VerseTextContainer>
      ))}
    </StyledTranslationView>
  );
};

const StyledVerseLink = styled.p`
  cursor: pointer;
`;

const VerseTextContainer = styled.div<{ highlight: boolean }>`
  background: ${({ highlight, theme }) => highlight && theme.colors.primary.medium};
`;

const StyledTranslationView = styled.div`
  max-width: 80%;
  margin: ${(props) => props.theme.spacing.medium} auto;
`;

const StyledText = styled.div<{ quranReaderStyles: QuranReaderStyles }>`
  letter-spacing: 0;
  font-size: min(5vw, ${(props) => props.quranReaderStyles.translationFontSize}rem);
  line-height: normal;
`;

export default TranslationView;
