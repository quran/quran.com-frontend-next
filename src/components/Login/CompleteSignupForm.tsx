import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import buildFormBuilderFormField from '../FormBuilder/buildFormBuilderFormField';
import FormBuilder from '../FormBuilder/FormBuilder';

import styles from './CompleteSignupForm.module.scss';
import EmailVerificationForm from './EmailVerificationForm';

import { completeSignup } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';
import FormField from 'types/FormField';

type CompleteSignupFormProps = {
  requiredFields: FormField[];
};

/**
 * If users' email is empty, return email verification form
 * otherwise, return normal user information form
 */

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ requiredFields }) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');

  const onSubmit = (data) => {
    logFormSubmission('complete_signUp');
    completeSignup(data).then(() => {
      // mutate the cache version of users/profile
      mutate(makeUserProfileUrl());
    });
  };

  const emailFormField = requiredFields.find((field) => field.field === 'email');
  const isEmailRequired = !!emailFormField;
  if (isEmailRequired) {
    return (
      <EmailVerificationForm
        emailFormField={buildFormBuilderFormField(
          { ...emailFormField, placeholder: t(`form.email`) },
          t,
        )}
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
        onSubmit={onSubmit}
        actionText={t('submit')}
      />
    </div>
  );
};

export default CompleteSignupForm;
