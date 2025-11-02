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
import { getTakeNotesNavigationUrl } from '@/utils/navigation';

const ShareQuranModal = dynamic(() => import('./ShareQuranModal'), {
  ssr: false,
});

const NewCard: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onTakeNotesClicked = () => {
    logButtonClick('homepage_take_notes_link');
  };

  const onCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <Card
        onClick={() => {
          logButtonClick('homepage_take_notes');
        }}
        className={styles.firstTimeReadingCard}
        link={getTakeNotesNavigationUrl()}
        isNewTab
      >
        <div className={styles.cardOuterContainer}>
          <div className={styles.cardWithIcon}>
            <div className={styles.iconContainer}>
              <span aria-hidden="true">✏️</span>
              <span className={styles.srOnly}>Pencil icon</span>
            </div>
            <div className={styles.link}>
              <Trans
                i18nKey="home:take-notes"
                components={{
                  modalLink: (
                    <Link
                      variant={LinkVariant.Blend}
                      href={getTakeNotesNavigationUrl()}
                      className={styles.linkHref}
                      onClick={onTakeNotesClicked}
                      isNewTab
                      shouldPrefetch={false}
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
