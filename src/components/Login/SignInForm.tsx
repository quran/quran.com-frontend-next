import { FC, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import AuthInput from './AuthInput';
import styles from './login.module.scss';
import SignInPasswordField from './SignInForm/SignInPasswordField';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import { getEmailField } from './SignUpFormFields/credentialFields';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useAuthRedirect from '@/hooks/auth/useAuthRedirect';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { signIn } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';
import { getForgotPasswordNavigationUrl } from '@/utils/navigation';

interface FormData {
  email: string;
  password: string;
}

interface Props {
  redirect?: string;
}

const SignInForm: FC<Props> = ({ redirect }) => {
  const { t } = useTranslation('login');
  const { redirectWithToken } = useAuthRedirect();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formFields: FormBuilderFormField[] = [
    {
      ...getEmailField(t),
      customRender: (props) => <AuthInput {...props} id="email" htmlType="email" />,
      errorClassName: styles.errorText,
      containerClassName: styles.inputContainer,
    },
    {
      field: 'password',
      type: FormFieldType.Password,
      placeholder: t('password-placeholder'),
      rules: [
        {
          type: RuleType.Required,
          value: true,
          errorMessage: t('error.password-required'),
        },
      ],
      customRender: SignInPasswordField,
      errorClassName: styles.errorText,
      containerClassName: styles.inputContainer,
    },
  ];

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    logFormSubmission('sign_in');
    try {
      const { data: response, errors } = await signIn(data.email, data.password);

      if (!response.success) {
        setIsSubmitting(false);
        return getFormErrors(t, ErrorType.API, errors);
      }

      redirectWithToken(redirect || '/', response?.token);
      return undefined;
    } catch (error) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.SIGN_IN);
    }
  };

  const renderAction = (props) => (
    <>
      <Link
        href={getForgotPasswordNavigationUrl()}
        variant={LinkVariant.Primary}
        className={styles.forgotPassword}
      >
        {t('forgot-password')}?
      </Link>

      <Button
        {...props}
        block
        shape={ButtonShape.Pill}
        type={ButtonType.Success}
        className={styles.submitButton}
      >
        {t('continue')}
      </Button>
    </>
  );

  return (
    <div className={styles.formContainer}>
      <FormBuilder
        formFields={formFields}
        onSubmit={handleSubmit}
        renderAction={renderAction}
        isSubmitting={isSubmitting}
        shouldSkipValidation
      />
    </div>
  );
};

export default SignInForm;
