import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import Trans from 'next-translate/Trans';

import styles from './NewCard.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import SunIcon from '@/icons/sun.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getFirstTimeReadingGuideNavigationUrl } from '@/utils/navigation';

const ShareQuranModal = dynamic(() => import('./ShareQuranModal'), {
  ssr: false,
});

interface Props {
  isGuestWithReadingSessions?: boolean;
  isUserWithReadingSessions?: boolean;
}

const NewCard: React.FC<Props> = ({ isGuestWithReadingSessions, isUserWithReadingSessions }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onFirstTimeReadingGuideClicked = () => {
    logButtonClick('homepage_first_time_reading_guide');
  };

  const onShareQuranClicked = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
    logButtonClick('homepage_share_quran');
  };

  const onCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <Card
        className={styles.firstTimeReadingCard}
        link={getFirstTimeReadingGuideNavigationUrl()}
        isNewTab
      >
        <div className={styles.cardOuterContainer}>
          <div className={styles.cardWithIcon}>
            <div className={styles.iconContainer}>
              <SunIcon />
            </div>
            <div className={styles.link}>
              <Trans
                i18nKey={
                  isGuestWithReadingSessions || isUserWithReadingSessions
                    ? 'home:know-someone'
                    : 'home:first-time-reading'
                }
                components={{
                  link: (
                    <Link
                      isNewTab
                      variant={LinkVariant.Blend}
                      href={getFirstTimeReadingGuideNavigationUrl()}
                      className={styles.linkHref}
                      onClick={onFirstTimeReadingGuideClicked}
                    />
                  ),
                  modalLink: (
                    <Link
                      variant={LinkVariant.Blend}
                      href={getFirstTimeReadingGuideNavigationUrl()}
                      className={styles.linkHref}
                      onClick={onShareQuranClicked}
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
