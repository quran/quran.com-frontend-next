import React from 'react';
import { useSelector } from 'react-redux';
import { camelizeKeys } from 'humps';
import InfiniteScroll from 'react-infinite-scroller';
import { useSWRInfinite } from 'swr';
import { VersesResponse } from 'types/APIResponses';
import Chapter from 'types/Chapter';
import styled from 'styled-components';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import { selectTranslations } from '../../redux/slices/QuranReader/translations';
import PageView from './PageView';

import TranslationView from './TranslationView';
import { ReadingView } from './types';
import { makeVersesUrl } from '../../utils/apiPaths';
import { selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import { buildQCFFontFace, isQCFFont } from '../../utils/fontFaceHelper';
import ContextMenu from './ContextMenu';
import Notes from './Notes/Notes';

type QuranReaderProps = {
  initialData: VersesResponse;
  chapter: Chapter;
};

const INFINITE_SCROLLER_THRESHOLD = 2000; // Number of pixels before the sentinel reaches the viewport to trigger loadMore()

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 */
const verseFetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json().then((data) => camelizeKeys(data.verses));
};

const QuranReader = ({ initialData, chapter }: QuranReaderProps) => {
  const isVerse = initialData.verses.length === 1;
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const selectedTranslations = useSelector(selectTranslations) as number[];
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      // if the response has only 1 verse it means we should set the page to that verse this will be combined with perPage which will be set to only 1.
      const page = isVerse ? initialData.verses[0].verseNumber : index + 1;
      return makeVersesUrl(chapter.id, {
        page,
        wordFields: `verse_key, verse_id, page_number, location, ${quranReaderStyles.quranFont}`,
        translations: selectedTranslations.join(', '),
        ...(isVerse && { perPage: 1 }),
      });
    },
    verseFetcher,
    {
      initialData: initialData.verses,
      revalidateOnFocus: false, // disable auto revalidation when window gets focused
      revalidateOnMount: true, // enable automatic revalidation when component is mounted. This is needed when the translations inside initialData don't match with the user preferences and would result in inconsistency either when we first load the QuranReader with pre-saved translations from the persistent store or when we change the translations' preferences after initial load.
    },
  );
  const readingView = useSelector(selectReadingView);
  const pageLimit = isVerse ? 1 : initialData.pagination.totalPages;
  const verses = data.flat(1);
  let view;

  if (readingView === ReadingView.QuranPage) {
    view = <PageView verses={verses} />;
  } else {
    view = <TranslationView verses={verses} quranReaderStyles={quranReaderStyles} />;
  }

  return (
    <>
      <ContextMenu />
      <Container isSideBarVisible={isSideBarVisible}>
        <StyledInfiniteScroll
          initialLoad={false}
          threshold={INFINITE_SCROLLER_THRESHOLD}
          hasMore={size < pageLimit}
          loadMore={() => {
            if (!isValidating) {
              setSize(size + 1);
            }
          }}
        >
          {isQCFFont(quranReaderStyles.quranFont) && (
            <style>{buildQCFFontFace(verses, quranReaderStyles.quranFont)}</style>
          )}
          {view}
        </StyledInfiniteScroll>
      </Container>
      <Notes />
    </>
  );
};

const StyledInfiniteScroll = styled(InfiniteScroll)`
  width: 100%;
`;

const Container = styled.div<{ isSideBarVisible: boolean }>`
  padding-top: calc(3 * ${(props) => props.theme.spacing.mega});
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    transition: ${(props) => props.theme.transitions.regular};
    margin-right: ${(props) => (props.isSideBarVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
  } ;
`;

export default QuranReader;
