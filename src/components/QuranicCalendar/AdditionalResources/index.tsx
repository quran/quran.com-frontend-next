import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './AdditionalResources.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import DivineBookClubIcon from '@/icons/dbc.svg';
import QrColoredIcon from '@/icons/qr-colored.svg';
import QrIcon from '@/icons/qr-logo.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranReflectTagUrl } from '@/utils/quranReflect/navigation';

type Props = {
  weekData?: QuranProgramWeekResponse;
  weekNumber: number;
};

type ResourceCard = {
  key: string;
  href: string;
  header: React.ReactNode;
  description: string;
  ctaLabel: string;
  onClick: () => void;
};

const QURAN_SPACE_URL = 'https://quran.space/';

const AdditionalResources: React.FC<Props> = ({ weekData, weekNumber }) => {
  const { t } = useTranslation('quranic-calendar');

  const videoLink = weekData?.videoUrl || '#';
  const qrLink = getQuranReflectTagUrl(`#week${weekNumber},#QuranicCalendar`);

  const onDivineBookClubClick = () => logButtonClick('quran_calendar_divine_book_club');
  const onQuranReflectClick = () => logButtonClick('quran_calendar_quran_reflect');
  const onQuranSpaceClick = () => logButtonClick('quran_calendar_quran_space');

  const resourceCards: ResourceCard[] = [
    {
      key: 'divine-book-club',
      href: videoLink,
      header: (
        <div className={styles.resourceIcon}>
          <DivineBookClubIcon />
        </div>
      ),
      description: t('divine-book-club-description'),
      ctaLabel: t('watch-episode', { weekNumber }),
      onClick: onDivineBookClubClick,
    },
    {
      key: 'quran-reflect',
      href: qrLink,
      header: (
        <div className={styles.resourceIcon}>
          <QrColoredIcon />
          <QrIcon />
        </div>
      ),
      description: t('quran-reflect-description'),
      ctaLabel: t('share-reflections'),
      onClick: onQuranReflectClick,
    },
    {
      key: 'quran-space',
      href: QURAN_SPACE_URL,
      header: (
        <h3 className={classNames(styles.resourceTitle, styles.quranSpaceTitle)}>
          <Trans
            i18nKey="quranic-calendar:quran-space-title"
            components={{ quran: <span className={styles.quranSpaceTitleAccent} /> }}
          />
        </h3>
      ),
      description: t('quran-space-description'),
      ctaLabel: t('quran-space-cta'),
      onClick: onQuranSpaceClick,
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('additional-resources')}</h2>
      <p className={styles.subtitle}>{t('additional-resources-subtitle')}</p>

      <div className={styles.resourcesGrid}>
        {resourceCards.map(({ key, href, header, description, ctaLabel, onClick }) => (
          <Link key={key} isNewTab className={styles.resourceCard} href={href} onClick={onClick}>
            {header}
            <p className={styles.resourceDescription}>{description}</p>
            <div className={styles.resourceButton}>
              {ctaLabel}
              <IconContainer
                size={IconSize.Xsmall}
                icon={<ArrowIcon />}
                shouldForceSetColors={false}
                className={styles.startLearningLinkIcon}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdditionalResources;
