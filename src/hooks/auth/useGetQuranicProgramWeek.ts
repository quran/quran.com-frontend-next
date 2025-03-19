import useSWR from 'swr/immutable';

import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { getQuranProgramWeek } from '@/utils/auth/api';
import { makeGetQuranicWeekUrl } from '@/utils/auth/apiPaths';

interface UseGetQuranicProgramWeekProps {
  programId: string;
  currentWeek: number;
  weekId?: string; // Optional, if not provided will use the current week
}

interface UseGetQuranicProgramWeekReturn {
  weekData: QuranProgramWeekResponse;
  isLoading: boolean;
  error: any;
  mutate: () => Promise<any>;
}

/**
 * Hook to get data for a specific week of the Quranic program
 * If weekId is not provided, it will use the currentWeek parameter
 *
 * @returns {UseGetQuranicProgramWeekReturn} An object containing the week data, loading state, and error
 */
const useGetQuranicProgramWeek = ({
  programId,
  currentWeek,
}: UseGetQuranicProgramWeekProps): UseGetQuranicProgramWeekReturn => {
  const { data, error, isValidating, mutate } = useSWR(
    programId ? makeGetQuranicWeekUrl(programId, currentWeek.toString()) : null,
    () => getQuranProgramWeek(programId, currentWeek.toString()),
  );

  return {
    weekData: data?.data,
    isLoading: isValidating && !data,
    error,
    mutate,
  };
};

export default useGetQuranicProgramWeek;
