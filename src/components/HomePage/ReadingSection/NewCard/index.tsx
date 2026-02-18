import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NewCard.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';

const NewCard: React.FC = () => {
  const { t } = useTranslation('home');

  const onRamadanChallengeClicked = () => {
    logButtonClick('homepage_ramadan_challenge_link');
  };

  return (
    <Card
      onClick={onRamadanChallengeClicked}
      className={styles.firstTimeReadingCard}
      link={ROUTES.RAMADAN_CHALLENGE}
    >
      <div className={styles.cardOuterContainer}>
        <div className={styles.cardWithIcon}>
          <div className={styles.iconContainer}>
            <span aria-hidden="true">✨</span>
          </div>
          <div className={styles.link}>{t('ramadan-challenge')}</div>
        </div>
        <IconContainer
          className={styles.arrowIcon}
          size={IconSize.Xsmall}
          icon={<ArrowIcon />}
          shouldForceSetColors={false}
        />
      </div>
    </Card>
  );
};

export default NewCard;
