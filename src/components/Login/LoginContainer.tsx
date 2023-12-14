import { useState } from 'react';

import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import { SubmissionResult } from '../FormBuilder/FormBuilder';

import EmailSent from './EmailSent';
import styles from './login.module.scss';
import ResendEmailSection from './ResendEmailSection';

import EmailLogin, { EmailLoginData, sendMagicLink } from '@/components/Login/EmailLogin';
import SocialLogin from '@/components/Login/SocialLogin';
import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { logButtonClick, logFormSubmission } from '@/utils/eventLogger';
import AuthType from 'types/auth/AuthType';

enum LoginType {
  Social = 'social',
  Email = 'email',
}

const LoginContainer = () => {
  const [loginType, setLoginType] = useState(LoginType.Social);
  const { t } = useTranslation();
  const { query } = useRouter();
  const redirect = query.r ? decodeURIComponent(query.r.toString()) : undefined;

  const [magicLinkVerificationCode, setMagicLinkVerificationCode] = useState('');
  const [email, setEmail] = useState('');

  const onEmailLoginSubmit = ({ email: emailInput }): SubmissionResult<EmailLoginData> => {
    setEmail(emailInput);
    return sendMagicLink(emailInput, redirect)
      .then(setMagicLinkVerificationCode)
      .catch(() => {
        return {
          errors: {
            email: t('common:error.email-login-fail'),
          },
        };
      });
  };

  const onMagicLinkClicked = () => {
    setLoginType(LoginType.Email);
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${AuthType.Email}_login`);
  };

  const onOtherOptionsClicked = () => {
    setLoginType(LoginType.Social);
    logButtonClick('other_auth_options');
  };

  const onResendEmailButtonClicked = () => {
    onEmailLoginSubmit({ email });
    logButtonClick('resend_email');
  };

  const onLoginWithEmailSubmit = (data) => {
    logFormSubmission('email_login');
    return onEmailLoginSubmit(data);
  };

  if (magicLinkVerificationCode) {
    return (
      <div className={styles.outerContainer}>
        <EmailSent email={email} verificationCode={magicLinkVerificationCode} />
        <ResendEmailSection
          onResendButtonClicked={onResendEmailButtonClicked}
          key={magicLinkVerificationCode}
        />
      </div>
    );
  }

  return (
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.title}>{t('login:login-title')}</div>
        {loginType === LoginType.Email && (
          <EmailLogin back={onOtherOptionsClicked} onSubmit={onLoginWithEmailSubmit} />
        )}

        {loginType === LoginType.Social && (
          <>
            <SocialLogin />
            {process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK_LOGIN === 'true' && (
              <Button
                onClick={onMagicLinkClicked}
                className={styles.loginButton}
                variant={ButtonVariant.Outlined}
                type={ButtonType.Success}
              >
                {t('login:continue-email')}
              </Button>
            )}
          </>
        )}
        <span className={styles.privacyText}>
          <Trans
            components={{
              link: <Link href="/privacy" variant={LinkVariant.Blend} isNewTab />,
            }}
            i18nKey="login:privacy-policy"
          />
        </span>
      </div>
    </div>
  );
};

export default LoginContainer;
