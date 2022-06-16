import { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import FormBuilder from '../FormBuilder/FormBuilder';

import styles from './CompleteSignupForm.module.scss';
import ResendEmailSection from './ResendEmailSection';

import { completeSignup, requestVerificationCode } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import ErrorMessageId from 'types/ErrorMessageId';
import { RuleType } from 'types/FieldRule';
import FormField, { FormFieldType } from 'types/FormField';

type EmailVerificationFormProps = {
  emailFormField: FormField;
};
type EmailFormData = {
  email: string;
};

type VerificationCodeFormData = {
  code: string;
};

const verificationCodeFormField = {
  field: 'code',
  type: FormFieldType.Number,
  rules: [{ type: RuleType.Required, value: true, errorId: ErrorMessageId.RequiredField }],
};

const EmailVerificationForm = ({ emailFormField }: EmailVerificationFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate } = useSWRConfig();
  const [email, setEmail] = useState<string>();
  const { t } = useTranslation('common');
  const [forceRerenderKey, setForceRerenderKey] = useState(0);

  const onEmailSubmitted = (data: EmailFormData) => {
    requestVerificationCode(data.email);
    setIsSubmitted(true);
    setEmail(data.email);
  };

  const onVerificationCodeSubmitted = (data: VerificationCodeFormData) => {
    return completeSignup({ email, verificationCode: data.code.toString() })
      .then(() => {
        // mutate the cache version of users/profile
        mutate(makeUserProfileUrl());
      })
      .catch(async (err) => {
        const errMessage = await err.json();
        const a = { errors: { code: errMessage.message } };
        return a;
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
        <FormBuilder formFields={[emailFormField]} onSubmit={onEmailSubmitted} />
      )}
    </div>
  );
};

export default EmailVerificationForm;
