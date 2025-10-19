import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr/immutable';

import { makeChapterUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { ChapterResponse } from 'types/ApiResponses';

interface Props {
  chapterIdOrSlug: string;
}

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
