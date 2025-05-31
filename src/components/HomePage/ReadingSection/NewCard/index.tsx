/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import Trans from 'next-translate/Trans';

import styles from './NewCard.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getBestDayNavigationUrl } from '@/utils/navigation';

const ShareQuranModal = dynamic(() => import('./ShareQuranModal'), {
  ssr: false,
});

const NewCard: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onBestDayClicked = () => {
    logButtonClick('homepage_best_day');
  };

  const onCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <Card
        onClick={() => {
          logButtonClick('homepage_best_day');
        }}
        className={styles.firstTimeReadingCard}
        link={getBestDayNavigationUrl()}
        isNewTab
      >
        <div className={styles.cardOuterContainer}>
          <div className={styles.cardWithIcon}>
            <div className={styles.iconContainer}>🕋</div>
            <div className={styles.link}>
              <Trans
                i18nKey="home:best-day"
                components={{
                  modalLink: (
                    <Link
                      variant={LinkVariant.Blend}
                      href={getBestDayNavigationUrl()}
                      className={styles.linkHref}
                      onClick={onBestDayClicked}
                      isNewTab
                    />
                  ),
                }}
              />
            </div>
          </div>
          <IconContainer
            className={styles.arrowIcon}
            size={IconSize.Xsmall}
            icon={<ArrowIcon />}
            shouldForceSetColors={false}
          />
        </div>
      </Card>
      {isShareModalOpen && (
        <ShareQuranModal isOpen={isShareModalOpen} onClose={onCloseShareModal} />
      )}
    </>
  );
};

export default NewCard;
