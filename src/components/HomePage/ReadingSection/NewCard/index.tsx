/* eslint-disable i18next/no-literal-string */
import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './NewCard.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getBeyondRamadanNavigationUrl } from '@/utils/navigation';

const NewCard: React.FC = () => {
  const onGrowBeyondRamadanClicked = () => {
    logButtonClick('homepage_grow_beyond_ramadan');
  };

  return (
    <Card
      onClick={onGrowBeyondRamadanClicked}
      className={styles.firstTimeReadingCard}
      link={getBeyondRamadanNavigationUrl()}
      isNewTab
    >
      <div className={styles.cardOuterContainer}>
        <div className={styles.cardWithIcon}>
          <div className={styles.iconContainer}>
            <span aria-hidden="true">🚀</span>
          </div>
          <div className={styles.link}>
            <Trans
              i18nKey="home:grow-beyond-ramadan"
              components={{
                modalLink: (
                  <Link
                    variant={LinkVariant.Blend}
                    href={getBeyondRamadanNavigationUrl()}
                    className={styles.linkHref}
                    onClick={onGrowBeyondRamadanClicked}
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
  );
};

export default NewCard;
