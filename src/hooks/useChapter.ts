import useTranslation from 'next-translate/useTranslation';
import { KeyedMutator } from 'swr';
import useSWR from 'swr/immutable';

import { makeChapterUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { ChapterResponse } from 'types/ApiResponses';

interface Props {
  chapterIdOrSlug: string;
}

export interface UseChapterResult {
  data?: ChapterResponse;
  error?: unknown;
  mutate: KeyedMutator<ChapterResponse | undefined>;
  isLoading: boolean;
}

/**
 * Custom hook to fetch chapter data by ID or slug using SWR for caching and revalidation.
 *
 * This hook provides a reactive way to fetch chapter information with built-in caching,
 * automatic revalidation, and error handling. It uses the current language context
 * to fetch localized chapter data.
 *
 * @param {object} props - Hook parameters
 * @param {string} props.chapterIdOrSlug - Chapter ID (number as string) or slug to fetch
 * @returns {UseChapterResult} Object containing chapter data, loading state, error handling, and mutate function
 *   - data: ChapterResponse | undefined - Chapter response from API, undefined while loading or on error
 *   - error: unknown | undefined - Error object if fetch failed, undefined on success
 *   - mutate: KeyedMutator<ChapterResponse | undefined> - SWR bound mutate function for manual cache revalidation
 *   - isLoading: boolean - True when fetching data and no cached data exists
 *
 * @example
 * ```tsx
 * const { data, error, isLoading } = useChapter({ chapterIdOrSlug: '1' });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error error={error} />;
 * if (!data) return null;
 *
 * return <div>{data.chapter.nameComplex}</div>;
 * ```
 *
 * @example
 * ```tsx
 * // Manual revalidation
 * const { mutate } = useChapter({ chapterIdOrSlug: '2' });
 *
 * const handleRefresh = () => {
 *   mutate(); // Revalidate the data
 * };
 * ```
 */
const useChapter = ({ chapterIdOrSlug }: Props): UseChapterResult => {
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
