import { FC } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import QuranLogo from '@/icons/logo_main.svg';

interface AuthHeaderProps {
  showSubtitle?: boolean;
  as?: React.ElementType;
}

const AuthHeader: FC<AuthHeaderProps> = ({ showSubtitle = false, as: As = 'div' }) => {
  const { t } = useTranslation('login');

  return (
    <div className={styles.authHeader}>
      <As className={styles.welcomeTitle}>
        <Trans
          i18nKey="login:unified-registration-1"
          components={{
            span: <span className={styles.boldText} />,
          }}
        />
      </As>
      {showSubtitle && (
        <div className={styles.subtitleAndLogoGroup}>
          <p className={styles.welcomeSubtitle}>{t('sign-in-or-sign-up')}</p>
          <div className={styles.quranLogoContainer}>
            <QuranLogo className={styles.quranLogo} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
