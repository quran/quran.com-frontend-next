import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import { selectIsUsingDefaultReciter, selectReciterId } from 'src/redux/slices/AudioPlayer/state';
import {
  selectIsUsingDefaultWordByWordLocale,
  selectWordByWordLocale,
} from 'src/redux/slices/QuranReader/readingPreferences';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import QueryParam from 'types/QueryParam';

/**
 * A hook that syncs between Redux values and the url by adding the redux
 * value to its corresponding query param in certain cases.
 */
const useSyncReduxAndQueryParams = () => {
  const router = useRouter();
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const selectedReciterId = useSelector(selectReciterId, shallowEqual);
  const selectedWordByWordLocale = useSelector(selectWordByWordLocale, shallowEqual);

  /**
   * Listen to changes in the translations and:
   *
   * 1. Remove translations query param if the user is using the default translations, or if the user un-selects all of the translations.
   * 2. Add translations query param if there was no query param in the url.
   */
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

  /**
   * Listen to changes in the reciter id and:
   *
   * 1. Remove reciter query param if the user is using the default reciter id.
   * 2. Add reciter query param if there was no query param in the url.
   */
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

  /**
   * Listen to changes in the word by word locale and:
   *
   * 1. Remove word by word locale query param if the user is using the default translations.
   * 2. Add word by word locale query param if there was no query param in the url.
   */
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
