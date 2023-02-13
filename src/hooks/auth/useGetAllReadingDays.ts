import { useEffect, useState } from 'react';

import useSWR from 'swr';

import { getAllReadingDays } from '@/utils/auth/api';
import { makeAllReadingDaysUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import isClient from '@/utils/isClient';

const useGetAllReadingDays = (from: string, to: string) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (isClient) {
        setShouldFetch(window.innerWidth >= 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // is screen size is < 768px, we don't want to fetch the data
  const {
    data: readingDays,
    isValidating,
    error,
  } = useSWR(isLoggedIn() && shouldFetch ? makeAllReadingDaysUrl(from, to) : null, () =>
    getAllReadingDays(from, to),
  );

  return {
    readingDays,
    isLoading: isValidating || !readingDays,
    error,
  };
};

export default useGetAllReadingDays;
