import { FC } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import AppleIcon from '@/icons/apple.svg';
import FacebookIcon from '@/icons/facebook.svg';
import GoogleIcon from '@/icons/google.svg';
import { makeAppleLoginUrl, makeFacebookLoginUrl, makeGoogleLoginUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import AuthType from 'types/auth/AuthType';

interface Props {
  redirect?: string;
  onEmailLoginClick: () => void;
}

const SocialButtons: FC<Props> = ({ redirect, onEmailLoginClick }) => {
  const { t } = useTranslation('login');

  const onSocialButtonClick = (type: AuthType) => {
    logButtonClick(type);
  };

  return (
    <div className={styles.authButtons} data-testid="auth-buttons">
      <Button
        href={makeGoogleLoginUrl(redirect)}
        prefix={<GoogleIcon />}
        className={classNames(styles.loginButton, styles.googleButton)}
        onClick={() => onSocialButtonClick(AuthType.Google)}
        shape={ButtonShape.Pill}
        shouldFlipOnRTL={false}
      >
        {t('continue-google')}
      </Button>
      <Button
        href={makeFacebookLoginUrl(redirect)}
        prefix={<FacebookIcon color="#4267b2" />}
        className={classNames(styles.loginButton, styles.facebookButton)}
        onClick={() => onSocialButtonClick(AuthType.Facebook)}
        shape={ButtonShape.Pill}
        shouldFlipOnRTL={false}
      >
        {t('continue-facebook')}
      </Button>
      <Button
        href={makeAppleLoginUrl(redirect)}
        prefix={<AppleIcon />}
        className={classNames(styles.loginButton, styles.appleButton)}
        onClick={() => onSocialButtonClick(AuthType.Apple)}
        shape={ButtonShape.Pill}
        shouldFlipOnRTL={false}
      >
        {t('continue-apple')}
      </Button>
      <Button
        onClick={() => {
          onEmailLoginClick();
          onSocialButtonClick(AuthType.Email);
        }}
        className={classNames(styles.loginButton, styles.emailButton)}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Pill}
      >
        {t('continue-email')}
      </Button>
    </div>
  );
};

export default SocialButtons;
