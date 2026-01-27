/* eslint-disable i18next/no-literal-string */
import React from 'react';

import styles from '../ChapterHeader.module.scss';

import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';

interface ChapterEventProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const ChapterEvent: React.FC<ChapterEventProps> = ({ title, description, ctaText, ctaLink }) => {
  return (
    <div className={styles.chapterEventWrapper}>
      <div className={styles.chapterEvent}>
        <p className={styles.chapterEventTitle}>{title}</p>
        <p className={styles.chapterEventDescription}>{description}</p>
        <Button
          className={styles.chapterEventCta}
          size={ButtonSize.Small}
          shape={ButtonShape.Rounded}
          href={ctaLink}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default ChapterEvent;
