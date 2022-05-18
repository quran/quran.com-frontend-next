import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import EmailSent from './EmailSent';
import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import EmailLogin, { sendMagicLink } from 'src/components/Login/EmailLogin';
import SocialLogin from 'src/components/Login/SocialLogin';

enum LoginType {
  Social = 'social',
  Email = 'email',
}

const LoginContainer = () => {
  const [loginType, setLoginType] = useState(LoginType.Social);
  const { t } = useTranslation('login');

  const [magicLinkVerificationCode, setMagicLinkVerificationCode] = useState('');
  const [email, setEmail] = useState('');

  const onEmailLoginSubmit = async (emailInput: string) => {
    setEmail(emailInput);
    //  TODO: handle error
    sendMagicLink(emailInput).then(setMagicLinkVerificationCode).catch(console.error);
  };

  if (magicLinkVerificationCode) {
    return (
      <div className={styles.outerContainer}>
        <EmailSent email={email} verificationCode={magicLinkVerificationCode} />
      </div>
    );
  }

  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.title}>{t('title')}</div>

        {loginType === LoginType.Email && (
          <EmailLogin back={() => setLoginType(LoginType.Social)} onSubmit={onEmailLoginSubmit} />
        )}

        {loginType === LoginType.Social && (
          <>
            <SocialLogin />

            <Button
              onClick={() => setLoginType(LoginType.Email)}
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

export default LoginContainer;
