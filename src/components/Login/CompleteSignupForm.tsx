import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import buildFormBuilderFormField from '../FormBuilder/buildFormBuilderFormField';

import TextInputField, { InputType } from './common/TextInputField';
import styles from './CompleteSignupForm.module.scss';
import EmailVerificationForm from './EmailVerificationForm';
import getFormErrors, { ErrorType } from './SignUpForm/errors';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import authStyles from '@/styles/auth/auth.module.scss';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { completeSignup } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';
import FormField from 'types/FormField';

type CompleteSignupFormProps = {
  requiredFields: FormField[];
  onSuccess?: () => void;
};

/**
 * If users' email is empty, return email verification form
 * otherwise, return normal user information form
 */

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ requiredFields, onSuccess }) => {
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');

  const handleSubmit = async (data) => {
    logFormSubmission('complete_signUp');

    try {
      const { data: response, errors } = await completeSignup(data);

      if (!response?.success) {
        return getFormErrors(t, ErrorType.API, errors);
      }

      // mutate the cache version of users/profile
      await mutate(makeUserProfileUrl());

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      return undefined;
    } catch (error) {
      return getFormErrors(t, ErrorType.SIGNUP);
    }
  };

  const emailFormField = requiredFields.find((field) => field.field === 'email');
  const isEmailRequired = !!emailFormField;
  if (isEmailRequired) {
    const formField = buildFormBuilderFormField(
      { ...emailFormField, placeholder: t(`form.email`) },
      t,
    );

    return (
      <EmailVerificationForm
        emailFormField={{
          ...formField,
          customRender: (props) => <TextInputField {...props} type={InputType.EMAIL} />,
          errorClassName: authStyles.errorText,
          containerClassName: authStyles.inputContainer,
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('complete-sign-up')}</h2>
      <FormBuilder
        formFields={requiredFields.map((field) => {
          const formField = buildFormBuilderFormField(
            { ...field, placeholder: t(`form.${field.field}`) },
            t,
          );

          // Add customRender with TextInputField to all fields except password fields
          if (field.field !== 'password' && field.field !== 'confirmPassword') {
            return {
              ...formField,
              customRender: (props) => (
                <TextInputField
                  {...props}
                  type={field.field === 'email' ? InputType.EMAIL : InputType.TEXT}
                />
              ),
              errorClassName: authStyles.errorText,
              containerClassName: authStyles.inputContainer,
            };
          }

          return formField;
        })}
        onSubmit={handleSubmit}
        actionText={t('submit')}
      />
    </div>
  );
};

export default CompleteSignupForm;
