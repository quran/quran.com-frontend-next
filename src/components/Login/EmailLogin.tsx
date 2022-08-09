import useTranslation from 'next-translate/useTranslation';

import MailIcon from '../../../public/icons/mail.svg';
import ArrowLeft from '../../../public/icons/west.svg';
import buildTranslatedErrorMessageByErrorId from '../FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder, { SubmissionResult } from '../FormBuilder/FormBuilder';

import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { makeSendMagicLinkUrl } from 'src/utils/auth/apiPaths';
import { EMAIL_VALIDATION_REGEX } from 'src/utils/validation';
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
            label: t('form.email'),
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

export const sendMagicLink = async (email) => {
  const response = await fetch(makeSendMagicLinkUrl(), {
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
