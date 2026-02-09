import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import { ToastFn, TranslateFn } from '../types';

import { useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import { RootState } from '@/redux/RootState';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { areArraysEqual } from '@/utils/array';
import DataContext from 'src/contexts/DataContext';

const useCollectionDetailViewDeps = () => {
  const { t, lang } = useTranslation('my-quran');
  const dispatch = useDispatch();
  const toast = useToast();
  const chaptersData = useContext(DataContext);
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();

  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(
    (state: RootState) => state.translations?.selectedTranslations ?? [],
    areArraysEqual,
  ) as number[];

  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  return {
    t: t as TranslateFn,
    lang,
    toast: toast as ToastFn,
    chaptersData,
    invalidateAllBookmarkCaches,
    isLoggedIn,
    globalMutate,
    dispatch,
    mushafId,
    selectedTranslations,
  };
};

export default useCollectionDetailViewDeps;
