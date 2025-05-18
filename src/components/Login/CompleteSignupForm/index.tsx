import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from '../CompleteSignupForm.module.scss';

import EmailVerificationSection from './EmailVerificationSection';

import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { signUp } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';
import SignUpRequest from 'types/auth/SignUpRequest';
import FormField from 'types/FormField';

type CompleteSignupFormProps = {
  requiredFields: FormField[];
};

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ requiredFields }) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [email, setEmail] = useState<string>();
  const [formData, setFormData] = useState<SignUpRequest>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const emailFormField = requiredFields.find((field) => field.field === 'email');
  const isEmailRequired = !!emailFormField;

  const handleEmailVerification = async (signUpData: SignUpRequest) => {
    try {
      const { data: response } = await signUp(signUpData);

      if (!response.success) {
        throw new Error('Failed to send verification code');
      }

      setFormData(signUpData);
      setIsEmailSubmitted(true);
      setEmail(signUpData.email);
      return undefined;
    } catch (error) {
      return {
        errors: {
          email: error?.message,
        },
      };
    }
  };

  const handleDirectSignup = async (signUpData: SignUpRequest) => {
    try {
      const { data: response } = await signUp(signUpData);

      if (!response.success) {
        throw new Error('Signup failed');
      }

      mutate(makeUserProfileUrl());
      return undefined;
    } catch (error) {
      return {
        errors: {
          firstName: error?.message,
          lastName: error?.message,
          email: error?.message,
          username: error?.message,
          password: error?.message,
          confirmPassword: error?.message,
        },
      };
    }
  };

  const onFormSubmit = async (data: Partial<SignUpRequest>) => {
    logFormSubmission('complete_signUp');
    const signUpData: SignUpRequest = { ...formData, ...data };

    if (isEmailRequired) {
      return handleEmailVerification(signUpData);
    }

    return handleDirectSignup(signUpData);
  };

  const onBackFromVerification = () => {
    setIsEmailSubmitted(false);
  };

  const onVerified = () => {
    setIsEmailVerified(true);
  };

  if (isEmailRequired && isEmailSubmitted && !isEmailVerified) {
    return (
      <EmailVerificationSection
        email={email}
        formData={formData}
        onBack={onBackFromVerification}
        onVerified={onVerified}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('complete-sign-up')}</h2>
      <FormBuilder
        formFields={requiredFields.map((field) =>
          buildFormBuilderFormField({ ...field, placeholder: t(`form.${field.field}`) }, t),
        )}
        onSubmit={onFormSubmit}
        actionText={t('submit')}
      />
    </div>
  );
};

export default CompleteSignupForm;
