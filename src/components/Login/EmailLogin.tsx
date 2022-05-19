import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import MailIcon from '../../../public/icons/mail.svg';
import ArrowLeft from '../../../public/icons/west.svg';

import CompleteSignupModal from './CompleteSignupModal';
import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import { getAuthApiPath } from 'src/utils/url';

type EmailLoginProps = { back: () => void; onSubmit: (email: string) => void };
const EmailLogin = ({ back, onSubmit }: EmailLoginProps) => {
  const { t } = useTranslation('login');
  const [emailInput, setEmailInput] = useState('');

  const onFormSubmitted = async (e) => {
    e.preventDefault();
    onSubmit(emailInput);
  };

  return (
    <form className={styles.innerContainer} onSubmit={onFormSubmitted}>
      <CompleteSignupModal isOpen />
      <Input
        isRequired
        htmlType="email"
        id="email-input"
        onChange={setEmailInput}
        fixedWidth={false}
        placeholder={t('email-placeholder')}
      />
      <Button
        htmlType="submit"
        prefix={<MailIcon />}
        className={styles.loginButton}
        type={ButtonType.Success}
      >
        {t('continue-email')}
      </Button>
      <Button
        onClick={back}
        className={styles.loginButton}
        variant={ButtonVariant.Ghost}
        type={ButtonType.Secondary}
        prefix={<ArrowLeft />}
      >
        {t('other-options')}
      </Button>
    </form>
  );
};

export const sendMagicLink = async (email) => {
  const response = await fetch(getAuthApiPath('auth/magiclogin'), {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({
      destination: email,
    }).toString(),
  });
  const responseJson = await response.json();
  const { success, code } = responseJson;
  if (success === true) {
    return code;
  }
  throw new Error(responseJson.message);
};

export default EmailLogin;
