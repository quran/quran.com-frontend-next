import { FC, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import AuthTabs, { AuthTab } from './AuthTabs';
import SocialButtons from './SocialButtons';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import Button from '@/dls/Button/Button';
import ArrowLeftIcon from '@/icons/west.svg';
import authStyles from '@/styles/auth/auth.module.scss';
import { signUp } from '@/utils/auth/authRequests';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import SignUpRequest from 'types/auth/SignUpRequest';

enum LoginView {
  SOCIAL = 'social',
  EMAIL = 'email',
  VERIFICATION = 'verification',
}

interface Props {
  redirect?: string;
}

const LoginContainer: FC<Props> = ({ redirect }) => {
  const { t } = useTranslation('login');
  const [loginView, setLoginView] = useState<LoginView>(LoginView.SOCIAL);
  const [activeTab, setActiveTab] = useState(AuthTab.SignIn);
  const [signUpData, setSignUpData] = useState<SignUpRequest | null>(null);
  const router = useRouter();

  const onBack = () => {
    logButtonClick('login_back');
    if (loginView === LoginView.VERIFICATION) {
      setLoginView(LoginView.EMAIL);
    } else if (loginView === LoginView.EMAIL) {
      setLoginView(LoginView.SOCIAL);
    } else {
      router.back();
    }
  };

  const onTabChange = (tab: AuthTab) => {
    logEvent('login_tab_change', { tab });
    setActiveTab(tab);
  };

  const onEmailLoginClick = () => {
    setLoginView(LoginView.EMAIL);
  };

  const onSignUpSuccess = (data: SignUpRequest) => {
    setSignUpData(data);
    setLoginView(LoginView.VERIFICATION);
  };

  const handleResendCode = async () => {
    if (!signUpData) return;

    try {
      const { data: response } = await signUp(signUpData);

      if (!response.success) {
        throw new Error('Failed to resend verification code');
      }
    } catch (error) {
      throw new Error('Failed to resend verification code');
    }
  };

  const renderContent = () => {
    if (loginView === LoginView.VERIFICATION) {
      return (
        <div className={authStyles.pageContainer}>
          <VerificationCodeForm
            email={signUpData?.email || ''}
            signUpData={signUpData}
            onBack={onBack}
            onResendCode={handleResendCode}
          />
        </div>
      );
    }

    return (
      <>
        <h1 className={authStyles.title}>{t('sign-in-or-sign-up')}</h1>
        {loginView === LoginView.SOCIAL ? (
          <SocialButtons redirect={redirect} onEmailLoginClick={onEmailLoginClick} />
        ) : (
          <>
            <AuthTabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              redirect={redirect}
              onSignUpSuccess={onSignUpSuccess}
            />
            <Button onClick={onBack} className={authStyles.backButton}>
              <ArrowLeftIcon />
              {t('back')}
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <div className={authStyles.outerContainer}>
      <div
        className={
          loginView === LoginView.VERIFICATION
            ? authStyles.fullContainer
            : authStyles.innerContainer
        }
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default LoginContainer;
