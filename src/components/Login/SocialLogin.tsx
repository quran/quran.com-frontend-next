import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import AppleIcon from '../../../public/icons/apple.svg';
import FacebookIcon from '../../../public/icons/facebook.svg';
import GoogleIcon from '../../../public/icons/google.svg';

import styles from './login.module.scss';

import Button from 'src/components/dls/Button/Button';
import { makeGoogleLoginUrl } from 'src/utils/auth/apiPaths';

const SocialLogin = () => {
  const { t } = useTranslation('login');
  return (
    <>
      <Button
        prefix={<GoogleIcon />}
        className={classNames(styles.loginButton, styles.googleButton)}
        href={makeGoogleLoginUrl()}
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
    </>
  );
};

export default SocialLogin;
