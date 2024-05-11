import { useCallback } from 'react';

import isArray from 'lodash/isArray';
import router from 'next/router';

import QueryParam from '@/types/QueryParam';

const useRemoveQueryParam = () => {
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
    [pathname, query],
  );
};

export default useRemoveQueryParam;
