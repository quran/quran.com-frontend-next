import { FC } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import QuranTextLogo from '@/icons/quran-text-logo.svg';

interface AuthHeaderProps {
  showSubtitle?: boolean;
}

const AuthHeader: FC<AuthHeaderProps> = ({ showSubtitle = false }) => {
  const { t } = useTranslation('login');

  return (
    <div className={styles.authHeader}>
      <h1 className={styles.welcomeTitle}>
        {t('welcome-title')}

        <Trans
          i18nKey="login:unified-registration-1"
          components={{
            span: <span className={styles.boldText} />,
          }}
        />
      </h1>
      {showSubtitle && (
        <div className={styles.subtitleAndLogoGroup}>
          <p className={styles.welcomeSubtitle}>{t('sign-in-or-sign-up')}</p>
          <div className={styles.quranLogoContainer}>
            <QuranTextLogo className={styles.quranLogo} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
