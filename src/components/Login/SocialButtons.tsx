import { FC } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';
import AppleIcon from '@/icons/apple.svg';
import FacebookIcon from '@/icons/facebook.svg';
import GoogleIcon from '@/icons/google.svg';
import { makeAppleLoginUrl, makeFacebookLoginUrl, makeGoogleLoginUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import AuthType from 'types/auth/AuthType';

interface Props {
  redirect?: string;
}

const SocialButtons: FC<Props> = ({ redirect }) => {
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
        size={ButtonSize.Medium}
        ariaLabel={t('continue-google')}
        data-testid="google-login-button"
      />

      <Button
        href={makeFacebookLoginUrl(redirect)}
        prefix={<FacebookIcon color="#4267b2" />}
        className={classNames(styles.loginButton, styles.facebookButton)}
        onClick={() => onSocialButtonClick(AuthType.Facebook)}
        shape={ButtonShape.Pill}
        shouldFlipOnRTL={false}
        size={ButtonSize.Medium}
        ariaLabel={t('continue-facebook')}
        data-testid="facebook-login-button"
      />

      <Button
        href={makeAppleLoginUrl(redirect)}
        prefix={<AppleIcon />}
        className={classNames(styles.loginButton, styles.appleButton)}
        onClick={() => onSocialButtonClick(AuthType.Apple)}
        shape={ButtonShape.Pill}
        shouldFlipOnRTL={false}
        size={ButtonSize.Medium}
        ariaLabel={t('continue-apple')}
        data-testid="apple-login-button"
      />
    </div>
  );
};

export default SocialButtons;
