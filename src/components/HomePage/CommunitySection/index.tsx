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
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { getBeyondRamadanNavigationUrl } from '@/utils/navigation';
import { getQRNavigationUrl } from '@/utils/quranReflect/navigation';

const EVENT = {
  title: 'Continue Your Quran Journey',
  description: 'Reading plans, reflections, and tools to stay connected all year.',
};

const CommunitySection = () => {
  const { lang, t } = useTranslation('home');

  const onQRCardClicked = () => {
    logButtonClick('homepage_community_qr_card');
  };

  const onEventCardClicked = () => {
    logButtonClick('homepage_community_continue_quran_journey_card');
  };

  return (
    <>
      <div className={styles.header}>
        <h1>{t('common:community.title')}</h1>
      </div>
      <div className={styles.cardsContainer} data-testid={TestId.COMMUNITY_SECTION}>
        {lang === Language.EN && (
          <Card
            className={classNames(styles.card, styles.eventCard)}
            link={getBeyondRamadanNavigationUrl()}
            isNewTab
            linkClassName={styles.link}
            onClick={onEventCardClicked}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>
                <div className={styles.cardHeader}>
                  <DiamondIcon className={styles.eventIcon} />
                  <p className={classNames(styles.cardDescription, styles.eventTitle)}>
                    {EVENT.title}
                  </p>
                </div>
                <IconContainer
                  size={IconSize.Xsmall}
                  icon={<ArrowIcon />}
                  shouldForceSetColors={false}
                  className={classNames(styles.arrowIcon, styles.eventArrowIcon)}
                />
              </div>
              <p className={classNames(styles.cardDescription, styles.eventDescription)}>
                {EVENT.description}
              </p>
            </div>
          </Card>
        )}
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
