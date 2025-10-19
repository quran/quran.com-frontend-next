import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr/immutable';

import { makeChapterUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { ChapterResponse } from 'types/ApiResponses';

interface Props {
  chapterIdOrSlug: string;
}

/**
 * Fetches chapter data by ID or slug.
 *
 * @param {object} props - Hook parameters
 * @param {string} props.chapterIdOrSlug - Chapter ID or slug to fetch
 * @returns {object} Chapter data and loading state
 *   - data: ChapterResponse - Chapter response from API
 *   - error: Error - Error object if fetch failed
 *   - mutate: Function - SWR mutate function for manual revalidation
 *   - isLoading: boolean - True when fetching data
 *
 * @example
 * const { data, error, isLoading } = useChapter({ chapterIdOrSlug: '1' });
 * if (isLoading) return <Spinner />;
 * if (error) return <Error error={error} />;
 * return <div>{data.chapter.nameComplex}</div>;
 */
const useChapter = ({ chapterIdOrSlug }: Props) => {
  const { lang } = useTranslation();

  const shouldFetchData = !!chapterIdOrSlug;

  const { data, error, mutate, isValidating } = useSWR<ChapterResponse>(
    shouldFetchData ? makeChapterUrl(chapterIdOrSlug, lang) : null,
    fetcher,
  );

  return {
    data,
    error,
    mutate,
    isLoading: isValidating && !data,
  };
};

export default useChapter;
