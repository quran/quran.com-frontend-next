import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';
import getFormErrors, { ErrorType } from './SignUpForm/errors';

import FormBuilder from '@/components/FormBuilder/FormBuilder';
import getSignUpFormFields from '@/components/Login/SignUpFormFields';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
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
      shape={ButtonShape.Pill}
      type={ButtonType.Success}
      className={styles.submitButton}
    >
      {t('sign-up')}
    </Button>
  );

  return (
    <div className={styles.formContainer}>
      <FormBuilder
        formFields={getSignUpFormFields(t)}
        onSubmit={handleSubmit}
        renderAction={renderAction}
      />
    </div>
  );
};

export default SignUpForm;
