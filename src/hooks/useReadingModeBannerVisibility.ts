import { useRouter } from 'next/router';

import { didUserSwitchReadingMode } from '@/hooks/readingModeSwitchTracker';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import { ReadingPreference } from '@/types/QuranReader';
import QueryParam from 'types/QueryParam';

const useReadingModeBannerVisibility = (): boolean => {
  const router = useRouter();
  const { isQueryParamDifferent }: { value: ReadingPreference; isQueryParamDifferent: boolean } =
    useGetQueryParamOrReduxValue(QueryParam.READING_MODE);

  if (!router.isReady) return false;

  return isQueryParamDifferent && !didUserSwitchReadingMode(router.asPath);
};

export default useReadingModeBannerVisibility;
