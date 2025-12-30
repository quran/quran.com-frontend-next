import { FC, useContext, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import AuthInput from './AuthInput';
import styles from './login.module.scss';
import SignInPasswordField from './SignInForm/SignInPasswordField';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import { getEmailField } from './SignUpFormFields/credentialFields';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useAuthRedirect from '@/hooks/auth/useAuthRedirect';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { signIn } from '@/utils/auth/authRequests';
import { syncPreferencesFromServer } from '@/utils/auth/syncPreferencesFromServer';
import { logFormSubmission } from '@/utils/eventLogger';
import { getForgotPasswordNavigationUrl } from '@/utils/navigation';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

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
  const dispatch = useDispatch();
  const audioService = useContext(AudioPlayerMachineContext);

  const { redirectWithToken } = useAuthRedirect();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formFields: FormBuilderFormField[] = [
    {
      ...getEmailField(t),
      dataTestId: 'signin-email-input',
      customRender: (props) => (
        <AuthInput {...props} id="email" htmlType="email" dataTestId={props.dataTestId} />
      ),
      errorClassName: styles.errorText,
      containerClassName: styles.inputContainer,
    },
    {
      field: 'password',
      type: FormFieldType.Password,
      placeholder: t('password-placeholder'),
      dataTestId: 'signin-password-input',
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

      let targetLocale = router.locale || 'en';
      try {
        const { appliedLocale } = await syncPreferencesFromServer({
          locale: targetLocale,
          dispatch,
          audioService,
        });
        if (appliedLocale) {
          targetLocale = appliedLocale;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to sync user preferences after login', error);
      }

      redirectWithToken(redirect || '/', response?.token, targetLocale);

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
        size={ButtonSize.Small}
        shape={ButtonShape.Pill}
        type={ButtonType.Success}
        className={styles.submitButton}
        data-testid="signin-continue-button"
      >
        {t('sign-in')}
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
