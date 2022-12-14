import React, { useContext } from 'react';

import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import ThumbsDownIcon from '../../../../public/icons/thumbsdown-outline.svg';
import ThumbsUpIcon from '../../../../public/icons/thumbsup-outline.svg';
import NavigationItem from '../NavigationItem';

import styles from './KalimatSearchNavigation.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseNumberRangeFromKey } from '@/utils/verse';
import { submitKalimatSearchResultFeedback } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import ChaptersData from 'types/ChaptersData';
import KalimatResultItem from 'types/Kalimat/KalimatResultItem';
import KalimatResultType from 'types/Kalimat/KalimatResultType';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

type Props = {
  isSearchDrawer: boolean;
  result: KalimatResultItem;
  searchQuery: string;
};

// eslint-disable-next-line react-func/max-lines-per-function
const getSearchNavigationResult = (
  chaptersData: ChaptersData,
  result: KalimatResultItem,
  t: Translate,
  locale: string,
): SearchNavigationResult => {
  const { id, type } = result;
  if (type === KalimatResultType.QuranJuz) {
    const juzNumber = id.substring(id.indexOf('j') + 1);
    return {
      name: t('common:juz'),
      key: juzNumber,
      resultType: SearchNavigationType.JUZ,
    };
  }
  if (type === KalimatResultType.QuranPage) {
    const pageNumber = id.substring(id.indexOf('p') + 1);
    return {
      name: t('common:page'),
      key: pageNumber,
      resultType: SearchNavigationType.PAGE,
    };
  }
  if (type === KalimatResultType.QuranRange) {
    const { surah, from, to } = getVerseNumberRangeFromKey(id);
    return {
      name: `${t('common:surah')} ${
        getChapterData(chaptersData, `${surah}`).transliteratedName
      } ${t('common:ayah')} ${toLocalizedNumber(from, locale)} - ${toLocalizedNumber(to, locale)}`,
      key: id,
      resultType: SearchNavigationType.RANGE,
    };
  }
  // when it's a chapter
  return {
    name: getChapterData(chaptersData, id).transliteratedName,
    key: id,
    resultType: SearchNavigationType.SURAH,
  };
};

const KalimatSearchNavigation: React.FC<Props> = ({ isSearchDrawer, searchQuery, result }) => {
  const { id } = result;
  const chaptersData = useContext(DataContext);
  const toast = useToast();
  const { t, lang } = useTranslation();

  const onFeedbackIconClicked = (isThumbsUp: boolean) => {
    const feedbackRequestParams = {
      query: searchQuery,
      feedbackScore: isThumbsUp ? 1 : -1,
      result: id,
    };
    submitKalimatSearchResultFeedback(feedbackRequestParams)
      .then(() => {
        toast('Feedback submitted successfully!', {
          status: ToastStatus.Success,
        });
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconsContainer}>
        <Button
          variant={ButtonVariant.Ghost}
          onClick={() => {
            onFeedbackIconClicked(true);
          }}
        >
          <ThumbsUpIcon />
        </Button>
        <Button
          variant={ButtonVariant.Ghost}
          onClick={() => {
            onFeedbackIconClicked(false);
          }}
        >
          <ThumbsDownIcon />
        </Button>
      </div>
      <NavigationItem
        isSearchDrawer={isSearchDrawer}
        navigation={getSearchNavigationResult(chaptersData, result, t, lang)}
      />
    </div>
  );
};

export default KalimatSearchNavigation;
