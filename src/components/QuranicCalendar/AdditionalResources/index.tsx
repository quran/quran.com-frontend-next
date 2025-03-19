import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AdditionalResources.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import DivineBookClubIcon from '@/icons/dbc.svg';
import QrColoredIcon from '@/icons/qr-colored.svg';
import QrIcon from '@/icons/qr-logo.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { getQuranReflectTagUrl } from '@/utils/quranReflect/navigation';

type Props = {
  weekData?: QuranProgramWeekResponse;
  weekNumber: number;
};

const AdditionalResources: React.FC<Props> = ({ weekData, weekNumber }) => {
  const { t } = useTranslation('quranic-calendar');

  const videoLink = weekData?.videoUrl || '#';
  const qrLink = getQuranReflectTagUrl(`#week${weekNumber},#QuranicCalendar`);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('additional-resources')}</h2>
      <p className={styles.subtitle}>{t('additional-resources-subtitle')}</p>

      <div className={styles.resourcesGrid}>
        <div className={styles.resourceCard}>
          <Link href={videoLink} isNewTab className={styles.cardLink} />
          <div className={styles.resourceContent}>
            <div className={styles.resourceIcon}>
              <DivineBookClubIcon />
            </div>
            <p className={styles.resourceDescription}>{t('divine-book-club-description')}</p>
            <Link href={videoLink} isNewTab className={styles.resourceButton}>
              {t('watch-episode', { weekNumber })}{' '}
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.startLearningLinkIcon}
              />
            </Link>
          </div>
        </div>

        <div className={styles.resourceCard}>
          <Link href={qrLink} isNewTab className={styles.cardLink} />
          <div className={styles.resourceContent}>
            <div className={styles.resourceIcon}>
              <QrColoredIcon />
              <QrIcon />
            </div>
            <p className={styles.resourceDescription}>{t('quran-reflect-description')}</p>
            <Link href={qrLink} isNewTab className={styles.resourceButton}>
              {t('share-reflections')}
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.startLearningLinkIcon}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalResources;
