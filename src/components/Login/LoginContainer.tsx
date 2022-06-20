import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { SubmissionResult } from '../FormBuilder/FormBuilder';

import EmailSent from './EmailSent';
import styles from './login.module.scss';
import ResendEmailSection from './ResendEmailSection';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import EmailLogin, { EmailLoginData, sendMagicLink } from 'src/components/Login/EmailLogin';
import SocialLogin from 'src/components/Login/SocialLogin';

enum LoginType {
  Social = 'social',
  Email = 'email',
}

const LoginContainer = () => {
  const [loginType, setLoginType] = useState(LoginType.Social);
  const { t } = useTranslation();

  const [magicLinkVerificationCode, setMagicLinkVerificationCode] = useState('');
  const [email, setEmail] = useState('');

  const onEmailLoginSubmit = ({ email: emailInput }): SubmissionResult<EmailLoginData> => {
    setEmail(emailInput);
    return sendMagicLink(emailInput)
      .then(setMagicLinkVerificationCode)
      .catch(() => {
        return {
          errors: {
            email: t('common:error.email-login-fail'),
          },
        };
      });
  };

  if (magicLinkVerificationCode) {
    return (
      <div className={styles.outerContainer}>
        <EmailSent email={email} verificationCode={magicLinkVerificationCode} />
        <ResendEmailSection
          onResendButtonClicked={() => onEmailLoginSubmit({ email })}
          key={magicLinkVerificationCode}
        />
      </div>
    );
  }

  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.title}>{t('login:title')}</div>

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
              {t('login:continue-email')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginContainer;
