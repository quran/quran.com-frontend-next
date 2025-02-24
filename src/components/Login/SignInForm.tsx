import { FC, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';
import SignInPasswordField from './SignInForm/SignInPasswordField';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import { getEmailField } from './SignUpFormFields/credentialFields';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formFields: FormBuilderFormField[] = [
    getEmailField(t),
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

      router.push(redirect || '/');
      return undefined;
    } catch (error) {
      setIsSubmitting(false);
      return getFormErrors(t, ErrorType.SIGN_IN);
    }
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('continue')}
    </Button>
  );

  return (
    <div className={styles.formContainer}>
      <FormBuilder
        formFields={formFields}
        onSubmit={handleSubmit}
        renderAction={renderAction}
        isSubmitting={isSubmitting}
      />
      <div className={styles.formActions}>
        <Link
          href={getForgotPasswordNavigationUrl()}
          variant={LinkVariant.Primary}
          className={styles.forgotPassword}
        >
          {t('forgot-password')}?
        </Link>
      </div>
    </div>
  );
};

export default SignInForm;
