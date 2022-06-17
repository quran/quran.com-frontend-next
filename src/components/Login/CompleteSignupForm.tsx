import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import FormBuilder from '../FormBuilder/FormBuilder';

import styles from './CompleteSignupForm.module.scss';
import EmailVerificationForm from './EmailVerificationForm';

import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
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
    completeSignup(data).then(() => {
      // mutate the cache version of users/profile
      mutate(makeUserProfileUrl());
    });
  };

  const emailFormField = requiredFields.find((field) => field.field === 'email');
  const isEmailRequired = !!emailFormField;
  if (isEmailRequired) {
    return <EmailVerificationForm emailFormField={emailFormField} />;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('complete-sign-up')}</h2>
      <FormBuilder formFields={requiredFields} onSubmit={onSubmit} />
    </div>
  );
};

export default CompleteSignupForm;
