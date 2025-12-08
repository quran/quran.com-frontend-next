import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import AuthHeader from './AuthHeader';
import styles from './login.module.scss';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import SocialButtons from './SocialButtons';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
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
      <AuthHeader as="h1" showSubtitle />
      <div className={styles.authTabs}>
        <div className={styles.authSwitchContainer}>
          <Switch
            items={items}
            selected={activeTab}
            onSelect={onTabChange}
            size={SwitchSize.Normal}
          />
        </div>
        {activeTab === AuthTab.SignIn ? (
          <SignInForm redirect={redirect} />
        ) : (
          <SignUpForm onSuccess={onSignUpSuccess} />
        )}
        <div className={styles.orSeparator}>
          <hr className={styles.orLine} />
          <span className={styles.orText}>{t('or')}</span>
          <hr className={styles.orLine} />
        </div>
        <SocialButtons redirect={redirect} />
      </div>
    </div>
  );
};

export default AuthTabs;
