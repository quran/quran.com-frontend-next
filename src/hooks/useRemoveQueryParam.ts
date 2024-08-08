import { useCallback } from 'react';

import isArray from 'lodash/isArray';
import { useRouter } from 'next/router';

import QueryParam from '@/types/QueryParam';

const useRemoveQueryParam = () => {
  const router = useRouter();
  const { pathname, query } = router;

  return useCallback(
    (queryParam: QueryParam | QueryParam[]) => {
      // @ts-ignore
      const params = new URLSearchParams(query);
      if (isArray(queryParam)) {
        queryParam.forEach((param) => params.delete(param));
      } else {
        params.delete(queryParam);
      }
      router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
    },
    [pathname, query, router],
  );
};

export default useRemoveQueryParam;
