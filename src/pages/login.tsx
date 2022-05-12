import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import AppleIcon from '../../public/icons/apple.svg';
import FacebookIcon from '../../public/icons/facebook.svg';
import GoogleIcon from '../../public/icons/google.svg';
import MailIcon from '../../public/icons/mail.svg';
import ArrowLeft from '../../public/icons/west.svg';

import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import { getAuthApiPath } from 'src/utils/url';

const LoginPage = () => {
  const [isUsingEmail, setIsUsingEmail] = useState(false);
  const { t } = useTranslation('login');

  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.title}>{t('title')}</div>
        {isUsingEmail ? (
          <>
            <Input id="email-input" fixedWidth={false} placeholder={t('email-placeholder')} />
            <Button prefix={<MailIcon />} className={styles.loginButton} type={ButtonType.Success}>
              {t('continue-email')}
            </Button>
            <Button
              onClick={() => setIsUsingEmail(false)}
              className={styles.loginButton}
              variant={ButtonVariant.Ghost}
              type={ButtonType.Secondary}
              prefix={<ArrowLeft />}
            >
              {t('other-options')}
            </Button>
          </>
        ) : (
          <>
            <Button
              prefix={<GoogleIcon />}
              className={classNames(styles.loginButton, styles.googleButton)}
              href={getAuthApiPath('auth/google')}
            >
              {t('continue-google')}
            </Button>
            <Button
              prefix={<FacebookIcon />}
              className={classNames(styles.loginButton, styles.facebookButton)}
            >
              {t('continue-facebook')}
            </Button>
            <Button prefix={<AppleIcon />} className={styles.loginButton}>
              {t('continue-apple')}
            </Button>
            <Button
              onClick={() => setIsUsingEmail(true)}
              className={styles.loginButton}
              variant={ButtonVariant.Ghost}
              type={ButtonType.Success}
            >
              {t('continue-email')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
