import styled from 'styled-components';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { camelizeKeys } from 'humps';
import { useRouter } from 'next/router';
import { QuranReaderStyles, selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { makeVerseByKeyUrl } from 'src/utils/apiPaths';
import { selectTranslations } from 'src/redux/slices/QuranReader/translations';
import Link from 'next/link';
import { VerseResponse } from 'types/APIResponses';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import ReaderContainer from '../ReaderContainer';

interface Props {
  initialData: Verse;
}

const verseFetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json().then((data: VerseResponse) => camelizeKeys(data.verse));
};

const VerseReader: React.FC<Props> = ({ initialData }) => {
  const router = useRouter();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const selectedTranslations = useSelector(selectTranslations) as number[];
  const {
    query: { chapterId },
  } = router;
  const { data } = useSWR(
    () =>
      makeVerseByKeyUrl(chapterId as string, initialData.verseNumber, {
        wordFields: `location, ${quranReaderStyles.quranFont}`,
        translations: selectedTranslations.join(', '),
      }),
    verseFetcher,
    {
      initialData,
      revalidateOnFocus: false, // disable auto revalidation when window gets focused
      revalidateOnMount: true, // This is needed when the translations inside initialData don't match with the user preferences and would result in inconsistency either when we first load the VerseReader with pre-saved translations from the persistent store or when we change the translations' preferences after initial load.
    },
  );

  return (
    <ReaderContainer>
      <Container>
        <Link as={`/${chapterId}`} href="/[chapterId]" passHref>
          <StyledChapterLink>Go back</StyledChapterLink>
        </Link>
        <VerseTextContainer highlight={false} key={data.id}>
          <VerseText words={data.words} />
          {data.translations?.map((translation: Translation) => (
            <StyledText
              quranReaderStyles={quranReaderStyles}
              key={translation.id}
              dangerouslySetInnerHTML={{ __html: translation.text }}
            />
          ))}
        </VerseTextContainer>
      </Container>
    </ReaderContainer>
  );
};

const StyledChapterLink = styled.p`
  cursor: pointer;
`;

const Container = styled.div`
  max-width: 80%;
  margin: ${(props) => props.theme.spacing.medium} auto;
`;
const VerseTextContainer = styled.div<{ highlight: boolean }>`
  background: ${({ highlight, theme }) => highlight && theme.colors.primary.medium};
`;

const StyledText = styled.div<{ quranReaderStyles: QuranReaderStyles }>`
  letter-spacing: 0;
  font-size: min(5vw, ${(props) => props.quranReaderStyles.translationFontSize}rem);
  line-height: normal;
`;

export default VerseReader;
