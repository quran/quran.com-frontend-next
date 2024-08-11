/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './QueryParamMessage.module.scss';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  selectWordByWordLocale,
  setSelectedWordByWordLocale,
} from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from '@/redux/slices/QuranReader/translations';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import { QuranReaderFlow } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { isValidTranslationsQueryParamValue } from '@/utils/queryParamValidator';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import QueryParam from 'types/QueryParam';

interface Props {
  translationsQueryParamDifferent: boolean;
  reciterQueryParamDifferent: boolean;
  wordByWordLocaleQueryParamDifferent: boolean;
}

const QueryParamMessage: React.FC<Props> = ({
  translationsQueryParamDifferent,
  reciterQueryParamDifferent,
  wordByWordLocaleQueryParamDifferent,
}) => {
  const { lang } = useTranslation('common');
  const router = useRouter();
  const audioService = useContext(AudioPlayerMachineContext);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const selectedReciterId = useXstateSelector(audioService, (state) => state.context.reciterId);
  const selectedWordByWordLocale = useSelector(selectWordByWordLocale, shallowEqual);
  const {
    actions: { onSettingsChange, onXstateSettingsChange },
  } = usePersistPreferenceGroup();

  /**
   * When the use clicks on use Redux, we will import the values from redux and
   * push them into the url params so that the useGetQueryParamOrReduxValue hook
   * picks and applies them.
   */
  const onResetToReduxStateClicked = () => {
    if (translationsQueryParamDifferent) {
      router.query[QueryParam.TRANSLATIONS] = selectedTranslations.join(',');
    }
    if (reciterQueryParamDifferent) {
      router.query[QueryParam.RECITER] = String(selectedReciterId);
    }
    if (wordByWordLocaleQueryParamDifferent) {
      router.query[QueryParam.WBW_LOCALE] = selectedWordByWordLocale;
    }
    // if is in Quranic Calendar flow, remove the flow query param
    if (router.query[QueryParam.FLOW] === QuranReaderFlow.QURANIC_CALENDER) {
      delete router.query[QueryParam.FLOW];
      // if hide arabic is true, remove it so that the arabic text get shown again
      if (router.query[QueryParam.HIDE_ARABIC] === 'true') {
        delete router.query[QueryParam.HIDE_ARABIC];
      }
    }

    router.push(router, undefined, { shallow: true });
  };

  /**
   * When the use clicks on persist query params, we will persist the values
   * from the query params into Redux.
   */
  const onPersistQueryParamsClicked = () => {
    if (
      translationsQueryParamDifferent &&
      isValidTranslationsQueryParamValue(router.query[QueryParam.TRANSLATIONS] as string)
    ) {
      const nextTranslations = (router.query[QueryParam.TRANSLATIONS] as string)
        .split(',')
        .map((stringValue) => Number(stringValue));

      onSettingsChange(
        'selectedTranslations',
        nextTranslations,
        setSelectedTranslations({ translations: nextTranslations, locale: lang }),
        setSelectedTranslations({ translations: selectedTranslations, locale: lang }),
        PreferenceGroup.TRANSLATIONS,
      );
    }

    if (wordByWordLocaleQueryParamDifferent) {
      const nextWordByWord = router.query[QueryParam.WBW_LOCALE] as string;
      onSettingsChange(
        'selectedWordByWordLocale',
        nextWordByWord,
        setSelectedWordByWordLocale({ value: nextWordByWord, locale: lang }),
        setSelectedWordByWordLocale({ value: selectedWordByWordLocale, locale: lang }),
        PreferenceGroup.READING,
      );
    }

    if (reciterQueryParamDifferent) {
      const nextReciterId = Number(router.query[QueryParam.RECITER]);
      onXstateSettingsChange(
        'reciter',
        nextReciterId,
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: nextReciterId }),
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: selectedReciterId }),
        PreferenceGroup.AUDIO,
      );
    }
  };

  return (
    <div className={styles.container}>
      <Trans
        i18nKey="quran-reader:query-param-message"
        components={[
          <span key={0} onClick={onResetToReduxStateClicked} className={styles.link} />,
          <span key={1} onClick={onPersistQueryParamsClicked} className={styles.link} />,
        ]}
      />
    </div>
  );
};

export default QueryParamMessage;
