import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ThumbsDownIcon from '../../../../public/icons/thumbsdown-outline.svg';
import ThumbsUpIcon from '../../../../public/icons/thumbsup-outline.svg';
import NavigationItem from '../NavigationItem';

import styles from './KalimatSearchNavigation.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import { getSearchNavigationResult } from '@/utils/kalimat/search';
import { submitKalimatSearchResultFeedback } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import KalimatResultItem from 'types/Kalimat/KalimatResultItem';

type Props = {
  isSearchDrawer: boolean;
  result: KalimatResultItem;
  searchQuery: string;
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
