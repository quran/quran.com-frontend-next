import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
import QuranLogo from '@/icons/logo_main.svg';
import QRColoredLogo from '@/icons/qr-colored.svg';
import QuranReflectLogo from '@/icons/qr-logo.svg';
import SignUpRequest from 'types/auth/SignUpRequest';

export enum AuthTab {
  SignIn = 'signin',
  SignUp = 'signup',
}

interface Props {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  redirect?: string;
  onSignUpSuccess: (data: SignUpRequest) => void;
}

const AuthTabs: FC<Props> = ({ activeTab, onTabChange, redirect, onSignUpSuccess }) => {
  const { t } = useTranslation('login');

  const items = [
    {
      name: t('sign-in'),
      value: AuthTab.SignIn,
    },
    {
      name: t('sign-up'),
      value: AuthTab.SignUp,
    },
  ];

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLogos}>
        <QuranLogo />
        <div className={styles.qrLogos}>
          <QRColoredLogo />
          <QuranReflectLogo />
        </div>
      </div>
      <hr className={styles.serviceDivider} />
      <div className={styles.authTabs}>
        <h1 className={styles.authTitle}>{t('sign-in-or-sign-up')}</h1>
        <div className={styles.authSwitchContainer}>
          <Switch
            items={items}
            selected={activeTab}
            onSelect={onTabChange}
            size={SwitchSize.Small}
          />
        </div>
        {activeTab === AuthTab.SignIn ? (
          <SignInForm redirect={redirect} />
        ) : (
          <SignUpForm onSuccess={onSignUpSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthTabs;
