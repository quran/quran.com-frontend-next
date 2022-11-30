import { useCallback } from 'react';

import router from 'next/router';

import QueryParam from '@/types/QueryParam';

const useRemoveQueryParam = () => {
  const { pathname, query } = router;

  return useCallback(
    (queryParam: QueryParam) => {
      // @ts-ignore
      const params = new URLSearchParams(query);
      params.delete(queryParam);
      router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
    },
    [pathname, query],
  );
};

export default useRemoveQueryParam;
