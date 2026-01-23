import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QiraatBanner.module.scss';

import HelpCircleIcon from '@/icons/help-circle.svg';
import Link, { LinkVariant } from '@/dls/Link/Link';

interface QiraatBannerProps {
  onLearnMoreClick?: () => void;
}

/**
 * Educational banner explaining what Qiraat are with a link to learn more.
 * Displays at the top of the Qiraat tab.
 */
const QiraatBanner: React.FC<QiraatBannerProps> = ({ onLearnMoreClick }) => {
  const { t } = useTranslation('common');

  // TODO: Replace with actual learning plan URL when available
  const learnMoreUrl = 'https://quran.com/learning-plans';

  const handleClick = () => {
    onLearnMoreClick?.();
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <HelpCircleIcon className={styles.icon} />
        <span className={styles.text}>{t('qiraat.what-are')}</span>
      </div>
      <Link
        href={learnMoreUrl}
        isNewTab
        variant={LinkVariant.Highlight}
        onClick={handleClick}
        className={styles.learnMore}
      >
        {t('qiraat.learn-more')} →
      </Link>
    </div>
  );
};

export default QiraatBanner;
