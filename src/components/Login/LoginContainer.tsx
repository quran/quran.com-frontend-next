import { useState } from 'react';

import { useRouter } from 'next/router';

import AuthTabs, { AuthTab } from './AuthTabs';
import BackButton from './BackButton';
import PrivacyPolicyText from './PrivacyPolicyText';
import VerificationCodeForm from './VerificationCode/VerificationCodeForm';

import authStyles from '@/styles/auth/auth.module.scss';
import QueryParam from '@/types/QueryParam';
import { signUp } from '@/utils/auth/authRequests';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import SignUpRequest from 'types/auth/SignUpRequest';

enum LoginView {
  EMAIL = 'email',
  VERIFICATION = 'verification',
}

const LoginContainer = () => {
  const [loginView, setLoginView] = useState<LoginView>(LoginView.EMAIL);
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
    } else {
      router.back();
    }
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
        <VerificationCodeForm
          email={signUpData?.email || ''}
          signUpData={signUpData as SignUpRequest}
          onBack={onBack}
          onResendCode={handleResendCode}
        />
      );
    }

    return (
      <>
        <AuthTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          redirect={redirect}
          onSignUpSuccess={handleEmailLoginSubmit}
        />
        <PrivacyPolicyText />
        <BackButton onClick={onBack} />
      </>
    );
  };

  return <div className={authStyles.outerContainer}>{renderContent()}</div>;
};

export default LoginContainer;
