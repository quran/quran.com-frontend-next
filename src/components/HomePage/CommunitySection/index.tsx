import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import QRColoredIcon from '@/icons/qr-colored.svg';
import QRLogoIcon from '@/icons/qr-logo.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getQRNavigationUrl } from '@/utils/quranReflect/navigation';

const CommunitySection = () => {
  const { t } = useTranslation('home');

  const onQRCardClicked = () => {
    logButtonClick('homepage_community_qr_card');
  };

  return (
    <>
      <div className={styles.header}>
        <h1>{t('common:community.title')}</h1>
      </div>
      <div className={styles.cardsContainer}>
        <Card
          className={styles.card}
          link={getQRNavigationUrl()}
          isNewTab
          linkClassName={styles.link}
          onClick={onQRCardClicked}
        >
          <div className={styles.cardContent}>
            <div className={styles.ramadanTitle}>
              <div className={styles.qrIcons}>
                <QRColoredIcon className={styles.coloredIcon} />
                <QRLogoIcon className={styles.logoIcon} />
              </div>
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.arrowIcon}
              />
            </div>
            <p className={styles.cardDescription}>{t('qr-community')}</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default CommunitySection;
