/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useContext, useMemo } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
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
import { areArraysEqual } from '@/utils/array';
import { isValidTranslationsQueryParamValue } from '@/utils/queryParamValidator';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import QueryParam from 'types/QueryParam';

interface Props {
  translationsQueryParamDifferent: boolean;
  reciterQueryParamDifferent: boolean;
  wordByWordLocaleQueryParamDifferent: boolean;
}

const getNumberOfDifferentParams = (
  translationsQueryParamDifferent: boolean,
  reciterQueryParamDifferent: boolean,
  wordByWordLocaleQueryParamDifferent: boolean,
): number => {
  let numberOfDifferentParams = 0;
  if (translationsQueryParamDifferent) {
    numberOfDifferentParams += 1;
  }
  if (reciterQueryParamDifferent) {
    numberOfDifferentParams += 1;
  }
  if (wordByWordLocaleQueryParamDifferent) {
    numberOfDifferentParams += 1;
  }
  return numberOfDifferentParams;
};

const QueryParamMessage: React.FC<Props> = ({
  translationsQueryParamDifferent,
  reciterQueryParamDifferent,
  wordByWordLocaleQueryParamDifferent,
}) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const audioService = useContext(AudioPlayerMachineContext);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const selectedReciterId = useXstateSelector(audioService, (state) => state.context.reciterId);
  const selectedWordByWordLocale = useSelector(selectWordByWordLocale, shallowEqual);
  const {
    actions: { onSettingsChange, onXstateSettingsChange },
  } = usePersistPreferenceGroup();

  // eslint-disable-next-line react-func/max-lines-per-function
  const text = useMemo(() => {
    const numberOfDifferentParams = getNumberOfDifferentParams(
      translationsQueryParamDifferent,
      reciterQueryParamDifferent,
      wordByWordLocaleQueryParamDifferent,
    );
    // if we are not using any params
    if (numberOfDifferentParams === 0) {
      return '';
    }
    let usedParamsText = '';
    if (numberOfDifferentParams === 1) {
      if (translationsQueryParamDifferent) {
        usedParamsText = t('translations');
      } else if (reciterQueryParamDifferent) {
        usedParamsText = t('reciter');
      } else if (wordByWordLocaleQueryParamDifferent) {
        usedParamsText = t('wbw-trans-lang');
      }
    } else if (numberOfDifferentParams === 2) {
      let isFirst = true;
      if (translationsQueryParamDifferent) {
        usedParamsText = isFirst
          ? `${t('translations')} ${t('and')}`
          : `${usedParamsText} ${t('translations')}`;
        isFirst = false;
      }
      if (reciterQueryParamDifferent) {
        usedParamsText = isFirst
          ? `${t('reciter')} ${t('and')}`
          : `${usedParamsText} ${t('reciter')}`;
        isFirst = false;
      }
      if (wordByWordLocaleQueryParamDifferent) {
        usedParamsText = isFirst
          ? `${t('wbw-trans-lang')} ${t('and')}`
          : `${usedParamsText} ${t('wbw-trans-lang')}`;
        isFirst = false;
      }
    } else if (numberOfDifferentParams === 3) {
      usedParamsText = `${t('translations')}, ${t('reciter')} ${t('and')} ${t('wbw-trans-lang')}`;
    }
    return usedParamsText;
  }, [
    reciterQueryParamDifferent,
    t,
    translationsQueryParamDifferent,
    wordByWordLocaleQueryParamDifferent,
  ]);

  /**
   * When the use clicks on use Redux, we will import the values from redux and
   * push them into the url params so that the useGetQueryParamOrReduxValue hook
   * picks and applies them.
   */
  const onResetToReduxStateClicked = () => {
    if (translationsQueryParamDifferent) {
      router.query[QueryParam.Translations] = selectedTranslations.join(',');
    }
    if (reciterQueryParamDifferent) {
      router.query[QueryParam.Reciter] = String(selectedReciterId);
    }
    if (wordByWordLocaleQueryParamDifferent) {
      router.query[QueryParam.WBW_LOCALE] = selectedWordByWordLocale;
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
      isValidTranslationsQueryParamValue(router.query[QueryParam.Translations] as string)
    ) {
      const nextTranslations = (router.query[QueryParam.Translations] as string)
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
      const nextReciterId = Number(router.query[QueryParam.Reciter]);
      onXstateSettingsChange(
        'reciter',
        nextReciterId,
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: nextReciterId }),
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: selectedReciterId }),
        PreferenceGroup.AUDIO,
      );
    }
  };

  const areUrlParamsUsed =
    translationsQueryParamDifferent ||
    reciterQueryParamDifferent ||
    wordByWordLocaleQueryParamDifferent;

  if (!areUrlParamsUsed) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <Trans
        i18nKey="quran-reader:query-param-message"
        components={[
          <span key={0}>{text}</span>,
          <span key={1} onClick={onResetToReduxStateClicked} className={styles.link} />,
          <span key={2} onClick={onPersistQueryParamsClicked} className={styles.link} />,
        ]}
      />
    </div>
  );
};

export default QueryParamMessage;
