import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';
import getFormErrors, { ErrorType } from './SignUpForm/errors';
import addCustomRenderToFormFields from './SignUpFormWithCustomRender';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import getSignUpFormFields from '@/components/Login/SignUpFormFields';
import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import { signUp } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';
import SignUpRequest from 'types/auth/SignUpRequest';

interface Props {
  onSuccess: (data: SignUpRequest) => void;
}

const SignUpForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation('login');

  const handleSubmit = async (data: SignUpRequest) => {
    logFormSubmission('sign_up');

    if (data.password !== data.confirmPassword) {
      return getFormErrors(t, ErrorType.MISMATCH);
    }

    try {
      const { data: response, errors } = await signUp(data);

      if (!response.success) {
        return getFormErrors(t, ErrorType.API, errors);
      }

      onSuccess(data);
      return undefined;
    } catch (error) {
      return getFormErrors(t, ErrorType.SIGNUP);
    }
  };

  const renderAction = (props) => (
    <Button
      {...props}
      block
      size={ButtonSize.Small}
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('sign-up')}
    </Button>
  );

  // Get the base form fields and add customRender to text fields
  const formFields = addCustomRenderToFormFields(getSignUpFormFields(t));

  return (
    <div className={styles.formContainer}>
      <FormBuilder
        formFields={formFields}
        onSubmit={handleSubmit}
        renderAction={renderAction}
        shouldSkipValidation
      />
    </div>
  );
};

export default SignUpForm;
