import React from 'react';
import { useSelector } from 'react-redux';
import { camelizeKeys } from 'humps';
import InfiniteScroll from 'react-infinite-scroller';
import { useSWRInfinite } from 'swr';
import { VersesResponse } from 'types/APIResponses';
import Chapter from 'types/ChapterType';
import styled from 'styled-components';
import { NOTES_SIDE_BAR_DESKTOP_WIDTH } from 'src/styles/constants';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import PageView from './PageView';
import TranslationView from './TranslationView';
import { ReadingView } from './types';
import Notes from './Notes/Notes';
import ContextMenu from './ContextMenu';
import { makeVersesUrl } from '../../utils/apiPaths';
import { selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';

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
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      // TODO: select the translation using the user preference
      return makeVersesUrl(chapter.id, {
        page: index + 1,
        wordFields: `verse_key, verse_id, page_number, location, ${quranReaderStyles.quranFont}`,
      });
    },
    verseFetcher,
    {
      initialData: initialData.verses,
      revalidateOnFocus: true,
    },
  );
  const readingView = useSelector(selectReadingView);
  const isSideBarVisible = useSelector(selectNotes).isVisible;
  const pageLimit = initialData.pagination.totalPages;
  const verses = data.flat(1);
  let view;

  if (readingView === ReadingView.QuranPage) {
    view = <PageView verses={verses} />;
  } else {
    view = <TranslationView verses={verses} />;
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
          {view}
        </StyledInfiniteScroll>
      </Container>
      <Notes />
    </>
  );
};

const Container = styled.div<{ isSideBarVisible: boolean }>`
  padding-top: calc(3 * ${(props) => props.theme.spacing.mega});
  @media only screen and (min-width: ${(props) => props.theme.breakpoints.tablet}) {
    transition: ${(props) => props.theme.transitions.regular};
    margin-right: ${(props) => (props.isSideBarVisible ? NOTES_SIDE_BAR_DESKTOP_WIDTH : 0)};
  } ;
`;
const StyledInfiniteScroll = styled(InfiniteScroll)`
  width: 100%;
`;

export default QuranReader;
