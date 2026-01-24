import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QiraatBanner.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import HelpCircleIcon from '@/icons/help-circle.svg';
import { logButtonClick } from '@/utils/eventLogger';

const LEARN_MORE_URL = 'https://quran.com/learning-plans';

/**
 * Educational banner explaining what Qiraat are with a link to learn more.
 * Displays at the top of the Qiraat tab.
 * @returns {JSX.Element} Rendered Qiraat banner UI
 */
const QiraatBanner: React.FC = () => {
  const { t } = useTranslation('common');

  const handleLearnMoreClick = () => {
    logButtonClick('qiraat_learn_more');
  };

  return (
    <div className={styles.banner}>
      <HelpCircleIcon className={styles.icon} />

      <span className={styles.text}>{t('qiraat.what-are')}</span>

      <Link
        href={LEARN_MORE_URL}
        isNewTab
        variant={LinkVariant.Highlight}
        onClick={handleLearnMoreClick}
        className={styles.learnMore}
      >
        {t('qiraat.learn-more')}
      </Link>
    </div>
  );
};

export default QiraatBanner;
