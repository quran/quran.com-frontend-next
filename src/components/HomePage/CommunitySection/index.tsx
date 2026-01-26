import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import DiamondIcon from '@/icons/diamond.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import QRLogoIcon from '@/icons/qr-logo.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';
import { getQRNavigationUrl } from '@/utils/quranReflect/navigation';

const CommunitySection = () => {
  const { t } = useTranslation('home');

  const onQRCardClicked = () => {
    logButtonClick('homepage_community_qr_card');
  };

  const onRamadanCardClicked = () => {
    logButtonClick('homepage_community_ramadan_card');
  };

  return (
    <>
      <div className={styles.header}>
        <h1>{t('common:community.title')}</h1>
      </div>
      <div className={styles.cardsContainer} data-testid={TestId.COMMUNITY_SECTION}>
        <Card
          className={styles.card}
          link={ROUTES.RAMADAN_2026}
          isNewTab
          linkClassName={styles.link}
          onClick={onRamadanCardClicked}
        >
          <div className={styles.cardContent}>
            <div className={styles.cardTitle}>
              <div className={styles.cardHeader}>
                <DiamondIcon className={styles.ramadanIcon} />
                <p className={classNames(styles.cardDescription, styles.ramadanTitle)}>
                  {t('ramadan.title')}
                </p>
              </div>
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.arrowIcon}
              />
            </div>
            <p className={styles.cardDescription}>{t('ramadan.description')}</p>
          </div>
        </Card>
        <Card
          className={styles.card}
          link={getQRNavigationUrl()}
          isNewTab
          linkClassName={styles.link}
          onClick={onQRCardClicked}
        >
          <div className={styles.cardContent}>
            <div className={styles.cardTitle}>
              <div className={styles.cardHeader}>
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
