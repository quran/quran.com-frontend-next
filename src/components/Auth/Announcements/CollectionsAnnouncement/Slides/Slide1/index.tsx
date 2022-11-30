import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './Slide1.module.scss';

import Button from '@/dls/Button/Button';
import Slide from '@/dls/Carousel/Slide';

type Props = {
  onComplete: () => void;
};

const Slide1: React.FC<Props> = ({ onComplete }) => {
  const { t } = useTranslation('common');
  return (
    <Slide
      action={
        <Button onClick={onComplete}>{t('announcements.auth-onboarding.slide-3.action')}</Button>
      }
      titleKey="common:announcements.collections-announcement.slide-1.title"
      description={
        <Trans
          components={{ br: <br />, li: <li className={styles.listItem} />, ul: <ul /> }}
          i18nKey="common:announcements.collections-announcement.slide-1.description"
        />
      }
    />
  );
};

export default Slide1;
