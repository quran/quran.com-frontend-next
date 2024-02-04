import { useContext, useMemo } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { selectIsUsingDefaultWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import { selectIsUsingDefaultTranslations } from '@/redux/slices/QuranReader/translations';
import { areArraysEqual, mergeTwoArraysUniquely } from '@/utils/array';
import { selectIsUsingDefaultReciter } from '@/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

const useIsUsingDefaultSettings = ({
  translationParams,
  selectedTranslations,
}: {
  translationParams?: number[];
  selectedTranslations?: number[];
} = {}) => {
  const { lang } = useTranslation();
  const audioService = useContext(AudioPlayerMachineContext);
  const isUsingDefaultReciter = useXstateSelector(audioService, (state) =>
    selectIsUsingDefaultReciter(state),
  );
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);

  const quranFont = useSelector(selectQuranFont);
  const mushafLines = useSelector(selectQuranMushafLines);

  const defaultState = useMemo(() => {
    return {
      quranReaderStyles: getQuranReaderStylesInitialState(lang),
      translations: getTranslationsInitialState(lang),
    };
  }, [lang]);

  const isUsingDefaultFont =
    defaultState.quranReaderStyles.quranFont === quranFont &&
    defaultState.quranReaderStyles.mushafLines === mushafLines;

  const areTranslationsEqual = useMemo(() => {
    if (!translationParams && !selectedTranslations) {
      return false;
    }

    const translations = mergeTwoArraysUniquely(
      translationParams ?? [],
      selectedTranslations ?? [],
    );

    return areArraysEqual(defaultState.translations.selectedTranslations, translations);
  }, [translationParams, selectedTranslations, defaultState.translations.selectedTranslations]);

  const isUsingDefaultSettings =
    isUsingDefaultFont && isUsingDefaultReciter && isUsingDefaultWordByWordLocale;

  if (translationParams || selectedTranslations) {
    return isUsingDefaultSettings && isUsingDefaultTranslations && areTranslationsEqual;
  }

  return isUsingDefaultSettings;
};

export default useIsUsingDefaultSettings;
