import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Card from '@/components/HomePage/Card';
import styles from '@/components/HomePage/ReadingSection/ReadingSection.module.scss';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import CirclesIcon from '@/icons/circles.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

const NoGoalOrStreakCard = () => {
  const { t } = useTranslation('home');

  return (
    <Card
      link={
        isLoggedIn()
          ? getReadingGoalNavigationUrl()
          : getLoginNavigationUrl(getReadingGoalNavigationUrl())
      }
    >
      <div className={styles.cardOuterContainer}>
        <div className={styles.cardWithIcon}>
          <div className={styles.iconContainer}>
            <CirclesIcon />
          </div>
          {t('achieve-quran-goals')}
        </div>
        <IconContainer
          size={IconSize.Xsmall}
          icon={<ArrowIcon />}
          shouldForceSetColors={false}
          className={styles.arrowIconRight}
        />
      </div>
      <p className={styles.stayConsistentText}>{t('stay-consistent')}</p>
    </Card>
  );
};

export default NoGoalOrStreakCard;
