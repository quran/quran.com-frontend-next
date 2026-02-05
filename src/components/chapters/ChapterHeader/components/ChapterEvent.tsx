/* eslint-disable i18next/no-literal-string */
import React from 'react';

import styles from '../ChapterHeader.module.scss';

import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';

interface ChapterEventProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const ChapterEvent: React.FC<ChapterEventProps> = ({ title, description, ctaText, ctaLink }) => {
  const handleCtaClick = () => {
    logButtonClick('chapter_event_cta', { ctaLink });
  };

  return (
    <div className={styles.chapterEventWrapper} data-testid={TestId.QURAN_READER_CHAPTER_EVENT}>
      <div className={styles.chapterEvent}>
        <p className={styles.chapterEventTitle}>{title}</p>
        <p className={styles.chapterEventDescription}>{description}</p>
        <Button
          className={styles.chapterEventCta}
          size={ButtonSize.Small}
          shape={ButtonShape.Rounded}
          href={ctaLink}
          onClick={handleCtaClick}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default ChapterEvent;
