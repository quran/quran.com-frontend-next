import useTranslation from 'next-translate/useTranslation';

import buildTranslatedErrorMessageByErrorId from '../FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder, { SubmissionResult } from '../FormBuilder/FormBuilder';

import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import MailIcon from '@/icons/mail.svg';
import ArrowLeft from '@/icons/west.svg';
import { makeSendMagicLinkUrl } from '@/utils/auth/apiPaths';
import { EMAIL_VALIDATION_REGEX } from '@/utils/validation';
import ErrorMessageId from 'types/ErrorMessageId';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export type EmailLoginData = {
  email: string;
};

type EmailLoginProps = {
  back: () => void;
  onSubmit: (data: { email: string }) => SubmissionResult<EmailLoginData>;
};

const fieldName = 'email';
const EmailLogin = ({ back, onSubmit }: EmailLoginProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <FormBuilder
        onSubmit={onSubmit}
        formFields={[
          {
            field: fieldName,
            type: FormFieldType.Text,
            placeholder: t('form.email'),
            rules: [
              {
                type: RuleType.Required,
                value: true,
                errorMessage: buildTranslatedErrorMessageByErrorId(
                  ErrorMessageId.RequiredField,
                  fieldName,
                  t,
                ),
              },
              {
                type: RuleType.Regex,
                value: EMAIL_VALIDATION_REGEX.source,
                errorMessage: buildTranslatedErrorMessageByErrorId(
                  ErrorMessageId.InvalidEmail,
                  fieldName,
                  t,
                ),
              },
            ],
          },
        ]}
        actionProps={{
          prefix: <MailIcon />,
          className: styles.loginButton,
          type: ButtonType.Success,
        }}
        actionText={t('login:continue-email')}
      />

      <Button
        onClick={back}
        htmlType="submit"
        className={styles.loginButton}
        variant={ButtonVariant.Ghost}
        type={ButtonType.Secondary}
        prefix={<ArrowLeft />}
      >
        {t('login:other-options')}
      </Button>
    </>
  );
};

export const sendMagicLink = async (email: string, redirect?: string) => {
  const response = await fetch(makeSendMagicLinkUrl(redirect), {
    method: 'post',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination: email,
    }),
  });
  const responseJson = await response.json();
  const { success, code } = responseJson;
  if (success === true) {
    return code;
  }
  throw new Error(responseJson.message);
};

export default EmailLogin;
