import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import buildTranslatedErrorMessageByErrorId from '../FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder from '../FormBuilder/FormBuilder';
import { FormBuilderFormField } from '../FormBuilder/FormBuilderTypes';

import styles from './CompleteSignupForm.module.scss';
import ResendEmailSection from './ResendEmailSection';

import { completeSignup, requestVerificationCode } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';
import ErrorMessageId from 'types/ErrorMessageId';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

type EmailVerificationFormProps = {
  emailFormField: FormBuilderFormField;
};
type EmailFormData = {
  email: string;
};

type VerificationCodeFormData = {
  code: string;
};

const EmailVerificationForm = ({ emailFormField }: EmailVerificationFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate } = useSWRConfig();
  const [email, setEmail] = useState<string>();
  const { t } = useTranslation('common');
  const [forceRerenderKey, setForceRerenderKey] = useState(0);

  const onEmailSubmitted = (data: EmailFormData) => {
    logFormSubmission('email_verification');
    requestVerificationCode(data.email);
    setIsSubmitted(true);
    setEmail(data.email);
  };

  const verificationCodeFormField: FormBuilderFormField = {
    field: 'code',
    type: FormFieldType.Number,
    placeholder: t('form.code'),
    rules: [
      {
        type: RuleType.Required,
        value: true,
        errorMessage: buildTranslatedErrorMessageByErrorId(ErrorMessageId.RequiredField, 'code', t),
      },
    ],
  };

  const onVerificationCodeSubmitted = (data: VerificationCodeFormData) => {
    logFormSubmission('verification_code');
    return completeSignup({ email, verificationCode: data.code.toString() })
      .then(() => {
        // mutate the cache version of users/profile
        mutate(makeUserProfileUrl());
      })
      .catch(async (err) => {
        const result = { errors: { code: err?.message } };
        return result;
      });
  };

  const onResendEmailRequested = () => {
    requestVerificationCode(email);
    setForceRerenderKey((preVal) => preVal + 1);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('email-verification.email-verification')}</h2>
      {isSubmitted ? (
        <>
          <p className={styles.emailSent}>
            <Trans
              i18nKey="common:email-verification.email-sent"
              values={{ email }}
              components={{
                strong: <strong className={styles.strong} />,
              }}
            />
          </p>
          <FormBuilder
            formFields={[verificationCodeFormField]}
            onSubmit={onVerificationCodeSubmitted}
            actionText={t('common:email-verification.verify-code')}
          />

          <ResendEmailSection
            key={forceRerenderKey}
            onResendButtonClicked={onResendEmailRequested}
          />
        </>
      ) : (
        <FormBuilder
          formFields={[emailFormField]}
          onSubmit={onEmailSubmitted}
          actionText={t('submit')}
        />
      )}
    </div>
  );
};

export default EmailVerificationForm;
