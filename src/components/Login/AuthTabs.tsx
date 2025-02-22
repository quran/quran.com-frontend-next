import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

import Tabs, { Tab } from '@/dls/Tabs/Tabs';
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

  const tabs: Tab[] = [
    {
      title: t('sign-in'),
      value: AuthTab.SignIn,
    },
    {
      title: t('sign-up'),
      value: AuthTab.SignUp,
    },
  ];

  return (
    <div className={styles.authTabs}>
      <h1 className={styles.authTitle}>{t('sign-in-or-sign-up')}</h1>
      <Tabs tabs={tabs} selected={activeTab} onSelect={onTabChange} className={styles.tab} />
      {activeTab === AuthTab.SignIn ? (
        <SignInForm redirect={redirect} />
      ) : (
        <SignUpForm onSuccess={onSignUpSuccess} />
      )}
    </div>
  );
};

export default AuthTabs;
