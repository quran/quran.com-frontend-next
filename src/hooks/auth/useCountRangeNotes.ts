import useSWRImmutable from 'swr/immutable';

import { countNotesWithinRange } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';

type Range = {
  from: string;
  to: string;
};

const useCountRangeNotes = (notesRange: Range) => {
  const { data, isValidating, error } = useSWRImmutable(
    notesRange && isLoggedIn() ? `countNotes/${notesRange.from}-${notesRange.to}` : null,
    async () => {
      return countNotesWithinRange(notesRange.from, notesRange.to);
    },
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeNotes;
