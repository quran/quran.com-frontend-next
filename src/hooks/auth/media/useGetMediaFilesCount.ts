import useSWRImmutable from 'swr/immutable';

import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { getMonthlyMediaFilesCount } from '@/utils/auth/api';
import { makeGetMonthlyMediaFilesCountUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useGetMediaFilesCount = (type: MediaType) => {
  const { data, isValidating, error, mutate } = useSWRImmutable(
    isLoggedIn() ? makeGetMonthlyMediaFilesCountUrl(type) : null,
    () => getMonthlyMediaFilesCount(type),
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
    mutate,
  };
};

export default useGetMediaFilesCount;
