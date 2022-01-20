import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import { selectIsUsingDefaultReciter, selectReciterId } from 'src/redux/slices/AudioPlayer/state';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import QueryParam from 'types/QueryParam';

const useSyncReduxAndQueryParams = () => {
  const router = useRouter();
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const selectedReciterId = useSelector(selectReciterId, shallowEqual);

  useEffect(() => {
    if (router.isReady) {
      if (isUsingDefaultTranslations) {
        // when the user resets the default settings, we should remove the value from the url
        if (
          router.query[QueryParam.Translations] &&
          router.query[QueryParam.Translations] === selectedTranslations.join(',')
        ) {
          delete router.query[QueryParam.Translations];
          router.push(router, undefined, { shallow: true });
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
    }
  }, [isUsingDefaultTranslations, router, selectedTranslations]);

  useEffect(() => {
    if (router.isReady) {
      if (isUsingDefaultReciter) {
        // when the user resets the default settings, we should remove the value from the url
        if (
          router.query[QueryParam.Reciter] &&
          router.query[QueryParam.Reciter] === String(selectedReciterId)
        ) {
          delete router.query[QueryParam.Reciter];
          router.push(router, undefined, { shallow: true });
        }
      } else if (!router.query[QueryParam.Reciter]) {
        router.query[QueryParam.Reciter] = String(selectedReciterId);
        router.push(router, undefined, { shallow: true });
      }
    }
  }, [isUsingDefaultReciter, router, selectedReciterId]);
};

export default useSyncReduxAndQueryParams;
