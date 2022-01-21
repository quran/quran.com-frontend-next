import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { selectIsUsingDefaultReciter, selectReciterId } from 'src/redux/slices/AudioPlayer/state';
import {
  selectIsUsingDefaultWordByWordLocale,
  selectWordByWordLocale,
  setSelectedWordByWordLocale,
} from 'src/redux/slices/QuranReader/readingPreferences';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { isValidTranslationsQueryParamValue } from 'src/utils/queryParamValidator';
import QueryParam from 'types/QueryParam';

const useSyncReduxAndQueryParams = (shouldPersistQueryParam: boolean) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const selectedReciterId = useSelector(selectReciterId, shallowEqual);
  const selectedWordByWordLocale = useSelector(selectWordByWordLocale, shallowEqual);

  useEffect(() => {
    if (shouldPersistQueryParam) {
      if (
        router.query[QueryParam.Translations] &&
        isValidTranslationsQueryParamValue(router.query[QueryParam.Translations] as string)
      ) {
        dispatch(
          setSelectedTranslations({
            translations: (router.query[QueryParam.Translations] as string)
              .split(',')
              .map((stringValue) => Number(stringValue)),
            locale: router.locale,
          }),
        );
      }
      if (router.query[QueryParam.WBW_LOCALE]) {
        dispatch(
          setSelectedWordByWordLocale({
            value: router.query[QueryParam.WBW_LOCALE] as string,
            locale: router.locale,
          }),
        );
      }
    }
  }, [dispatch, router.locale, router.query, shouldPersistQueryParam]);

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

  useEffect(() => {
    if (router.isReady) {
      if (isUsingDefaultWordByWordLocale) {
        // when the user resets the default settings, we should remove the value from the url
        if (
          router.query[QueryParam.WBW_LOCALE] &&
          router.query[QueryParam.WBW_LOCALE] === selectedWordByWordLocale
        ) {
          delete router.query[QueryParam.WBW_LOCALE];
          router.push(router, undefined, { shallow: true });
        }
      } else if (!router.query[QueryParam.WBW_LOCALE]) {
        router.query[QueryParam.WBW_LOCALE] = selectedWordByWordLocale;
        router.push(router, undefined, { shallow: true });
      }
    }
  }, [isUsingDefaultWordByWordLocale, router, selectedWordByWordLocale]);
};

export default useSyncReduxAndQueryParams;
