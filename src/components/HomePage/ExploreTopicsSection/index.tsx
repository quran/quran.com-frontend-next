import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ExploreTopicsSection.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';

const TOPICS = [
  {
    slug: 'what-is-ramadan',
    logKey: 'what-is-ramadan',
    key: 'what-is-ramadan',
    isHighlighted: true,
  },
  {
    slug: 'about-the-quran',
    logKey: 'about-quran',
    key: 'about-quran',
  },
  // {
  //   slug: 'jesus-in-the-quran',
  //   logKey: 'jesus-in-quran',
  //   key: 'jesus-in-quran',
  // },
  {
    slug: 'collections/the-authority-and-importance-of-the-sunnah-clem7p7lf15921610rsdk4xzulfj',
    key: 'sunnah',
    logKey: 'sunnah_collection',
  },
];

const ExploreTopicsSection = () => {
  const { t } = useTranslation('quick-links');
  return (
    <>
      <div className={styles.header}>
        <h1>{t('home:explore-topics')}</h1>
      </div>
      <div className={styles.container}>
        {TOPICS.map((topic) => {
          return (
            <Button
              size={ButtonSize.Small}
              key={topic.slug}
              href={`/${topic.slug}`}
              type={ButtonType.Primary}
              variant={ButtonVariant.Compact}
              shape={ButtonShape.Pill}
              onClick={() => {
                logButtonClick(`explore_topics_${topic.logKey}`);
              }}
              isNewTab
              className={classNames(styles.topic, {
                [styles.highlighted]: topic.isHighlighted,
              })}
            >
              <div>
                {t(topic.key)} <ArrowIcon />
              </div>
            </Button>
          );
        })}
      </div>
    </>
  );
};

export default ExploreTopicsSection;
