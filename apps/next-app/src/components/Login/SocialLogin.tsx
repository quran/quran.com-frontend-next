import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import { BsApple } from 'react-icons/bs';
import { BsFacebook } from 'react-icons/bs';
import { BsGoogle } from 'react-icons/bs';

import styles from './login.module.scss';

import Button from 'src/components/dls/Button/Button';
import {
  makeGoogleLoginUrl,
  makeFacebookLoginUrl,
  makeAppleLoginUrl,
} from 'src/utils/auth/apiPaths';

const SocialLogin = () => {
  const { t } = useTranslation('login');
  return (
    <>
      {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true' && (
        <Button
          prefix={<BsGoogle />}
          className={classNames(styles.loginButton, styles.googleButton)}
          href={makeGoogleLoginUrl()}
        >
          {t('continue-google')}
        </Button>
      )}
      {process.env.NEXT_PUBLIC_ENABLE_FB_LOGIN === 'true' && (
        <Button
          prefix={<BsFacebook />}
          className={classNames(styles.loginButton, styles.facebookButton)}
          href={makeFacebookLoginUrl()}
        >
          {t('continue-facebook')}
        </Button>
      )}
      {process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN === 'true' && (
        <Button
          href={makeAppleLoginUrl()}
          prefix={<BsApple />}
          className={styles.loginButton}
        >
          {t('continue-apple')}
        </Button>
      )}
    </>
  );
};

export default SocialLogin;
