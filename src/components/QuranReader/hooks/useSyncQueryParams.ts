import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import QueryParam from 'types/QueryParam';

const useSyncQueryParams = () => {
  const router = useRouter();
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);

  useEffect(() => {
    if (isUsingDefaultTranslations) {
      // when the user reset the default settings, we should remove the value from the url
      if (router.query[QueryParam.Translations]) {
        if (router.query[QueryParam.Translations] === selectedTranslations.join(',')) {
          delete router.query[QueryParam.Translations];
          router.push(router, undefined, { shallow: true });
        }
      }
    } else if (!selectedTranslations.length) {
      // if the user un-selects all translations but there is still translations in the url, we remove it
      if (router.query[QueryParam.Translations]) {
        delete router.query[QueryParam.Translations];
        router.push(router, undefined, { shallow: true });
      }
    } else if (!router.query[QueryParam.Translations]) {
      router.query[QueryParam.Translations] = selectedTranslations.join(',');
      router.push(router, undefined, { shallow: true });
    }

    // else if (selectedTranslations.length) {
    //   const queryParamValue = selectedTranslations.join(',');
    //   // if there is a difference between the current query and the new value, we should update the url
    //   if (router.query[QueryParam.Translations] !== queryParamValue) {
    //     router.query[QueryParam.Translations] = queryParamValue;
    //     router.push(router, undefined, { shallow: true });
    //   }
    // } else if (router.query[QueryParam.Translations]) {
    //   // if the user un-selected all translations but there is still translations in the url, we remove it
    //   delete router.query[QueryParam.Translations];
    //   router.push(router, undefined, { shallow: true });
    // }
  }, [isUsingDefaultTranslations, router, selectedTranslations]);
};

export default useSyncQueryParams;
