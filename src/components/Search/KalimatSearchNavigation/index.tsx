import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ThumbsDownIcon from '../../../../public/icons/thumbsdown-outline.svg';
import ThumbsUpIcon from '../../../../public/icons/thumbsup-outline.svg';
import NavigationItem from '../NavigationItem';

import styles from './KalimatSearchNavigation.module.scss';

import { submitKalimatSearchResultFeedback } from 'src/api';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import { SearchNavigationType } from 'types/SearchNavigationResult';

type Props = {
  isSearchDrawer: boolean;
  chapterId: string;
  searchQuery: string;
};

const KalimatSearchNavigation: React.FC<Props> = ({ chapterId, isSearchDrawer, searchQuery }) => {
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);
  const toast = useToast();
  const { t } = useTranslation();

  const onFeedbackIconClicked = (isThumbsUp: boolean) => {
    const feedbackRequestParams = {
      query: searchQuery,
      feedbackScore: isThumbsUp ? 1 : -1,
      result: chapterId,
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
        navigation={{
          name: chapterData.transliteratedName,
          key: chapterId,
          resultType: SearchNavigationType.SURAH,
        }}
      />
    </div>
  );
};

export default KalimatSearchNavigation;
