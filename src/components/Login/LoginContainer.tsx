import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import AuthTabs, { AuthTab } from './AuthTabs';
import ServiceCard from './ServiceCard';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import ArrowLeft from '@/icons/west.svg';
import authStyles from '@/styles/auth/auth.module.scss';
import QueryParam from '@/types/QueryParam';
import { signUp } from '@/utils/auth/authRequests';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import SignUpRequest from 'types/auth/SignUpRequest';

enum LoginView {
  SOCIAL = 'social',
  EMAIL = 'email',
  VERIFICATION = 'verification',
}

const LoginContainer = () => {
  const { t } = useTranslation('login');
  const [loginView, setLoginView] = useState<LoginView>(LoginView.SOCIAL);
  const [activeTab, setActiveTab] = useState(AuthTab.SignIn);
  const [signUpData, setSignUpData] = useState<Partial<SignUpRequest> | null>(null);
  const router = useRouter();
  const { query } = useRouter();
  const redirect = query?.[QueryParam.REDIRECT_TO]
    ? decodeURIComponent(query?.[QueryParam.REDIRECT_TO]?.toString())
    : undefined;

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

  const onEmailLoginClick = () => {
    logEvent('login_email_click');
    setLoginView(LoginView.EMAIL);
  };

  const onTabChange = (tab: AuthTab) => {
    logEvent('login_tab_change', { tab });
    setActiveTab(tab);
  };

  const handleEmailLoginSubmit = async (data: {
    email: string;
  }): Promise<void | { errors: { email: string } }> => {
    setSignUpData(data);
    setLoginView(LoginView.VERIFICATION);
  };

  const handleResendCode = async () => {
    if (!signUpData?.email) return;

    try {
      const { data: response } = await signUp(signUpData as SignUpRequest);

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
            signUpData={signUpData as SignUpRequest}
            onBack={onBack}
            onResendCode={handleResendCode}
          />
        </div>
      );
    }

    if (loginView === LoginView.EMAIL) {
      return (
        <>
          <AuthTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            redirect={redirect}
            onSignUpSuccess={handleEmailLoginSubmit}
          />
          <Button variant={ButtonVariant.Compact} onClick={onBack}>
            <ArrowLeft /> {t('back')}
          </Button>
        </>
      );
    }

    const benefits = {
      quran: [
        { id: 'feature-6', label: t('feature-6') },
        { id: 'feature-1', label: t('feature-1') },
        { id: 'feature-2', label: t('feature-2') },
        { id: 'feature-3', label: t('feature-3') },
        { id: 'feature-4', label: t('feature-4') },
        { id: 'feature-5', label: t('feature-5') },
      ],
      reflect: [
        { id: 'reflect-1', label: t('reflect-feature-1') },
        { id: 'reflect-2', label: t('reflect-feature-2') },
        { id: 'reflect-3', label: t('reflect-feature-3') },
        { id: 'reflect-4', label: t('reflect-feature-4') },
      ],
    };

    return (
      <ServiceCard
        benefits={benefits}
        isEmailLogin={false}
        onOtherOptionsClicked={onEmailLoginClick}
        redirect={redirect}
      />
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
