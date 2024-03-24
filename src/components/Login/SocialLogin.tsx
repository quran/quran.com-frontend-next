import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import Button from '@/dls/Button/Button';
import AppleIcon from '@/icons/apple.svg';
import FacebookIcon from '@/icons/facebook.svg';
import GoogleIcon from '@/icons/google.svg';
import { makeGoogleLoginUrl, makeFacebookLoginUrl, makeAppleLoginUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import AuthType from 'types/auth/AuthType';

type Props = {
  redirect?: string;
};

const SocialLogin: React.FC<Props> = ({ redirect }) => {
  const { t } = useTranslation('login');
  const logSocialLoginClick = (type: AuthType) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${type}_login`);
  };
  return (
    <>
      {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true' && (
        <Button
          prefix={<GoogleIcon />}
          className={classNames(styles.loginButton, styles.googleButton)}
          href={makeGoogleLoginUrl(redirect)}
          shouldFlipOnRTL={false}
          onClick={() => {
            logSocialLoginClick(AuthType.Google);
          }}
        >
          {t('continue-google')}
        </Button>
      )}
      {process.env.NEXT_PUBLIC_ENABLE_FB_LOGIN === 'true' && (
        <Button
          prefix={<FacebookIcon />}
          className={classNames(styles.loginButton, styles.facebookButton)}
          href={makeFacebookLoginUrl(redirect)}
          shouldFlipOnRTL={false}
          onClick={() => {
            logSocialLoginClick(AuthType.Facebook);
          }}
        >
          {t('continue-facebook')}
        </Button>
      )}
      {process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN === 'true' && (
        <Button
          href={makeAppleLoginUrl(redirect)}
          prefix={<AppleIcon />}
          className={styles.loginButton}
          shouldFlipOnRTL={false}
          onClick={() => {
            logSocialLoginClick(AuthType.Apple);
          }}
        >
          {t('continue-apple')}
        </Button>
      )}
    </>
  );
};

export default SocialLogin;
