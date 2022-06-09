import capitalize from 'lodash/capitalize';
import useTranslation from 'next-translate/useTranslation';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import styles from './CompleteSignupForm.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import { EMAIL_VALIDATION_REGEX } from 'src/utils/validation';
import CompleteSignupRequest, { ProfileRequiredFields } from 'types/CompleteSignupRequest';

type CompleteSignupFormProps = {
  requiredFields: ProfileRequiredFields[];
};

const requiredFieldType: { [key in ProfileRequiredFields]: string } = {
  firstName: 'text',
  lastName: 'text',
  email: 'email',
};

type ValidationPattern = {
  [key in string]: {
    regex: RegExp;
    validationMessageId: string;
  };
};
const requiredFieldValidationPattern: ValidationPattern = {
  email: {
    regex: EMAIL_VALIDATION_REGEX,
    validationMessageId: 'email',
  },
};

const CompleteSignupForm = ({ requiredFields }: CompleteSignupFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompleteSignupRequest>();
  const { mutate } = useSWRConfig();
  const { t } = useTranslation('common');

  const onSubmit = handleSubmit((data) => {
    completeSignup(data).then(() => {
      // mutate the cache version of users/profile
      mutate(makeUserProfileUrl());
    });
  });
  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <h2 className={styles.title}>{t('complete-sign-up')}</h2>
      {requiredFields?.map((requiredField) => (
        <Controller
          key={requiredField}
          control={control}
          name={requiredField}
          rules={{
            pattern: {
              value: requiredFieldValidationPattern[requiredField]?.regex,
              message: t(
                `validation.${requiredFieldValidationPattern[requiredField]?.validationMessageId}`,
                { field: capitalize(requiredField) },
              ),
            },
            required: {
              message: t('validation.required', { field: capitalize(requiredField) }),
              value: true,
            },
          }}
          render={({ field }) => (
            <div className={styles.inputContainer}>
              <Input
                htmlType={requiredFieldType[requiredField]}
                key={requiredField}
                onChange={(val) => field.onChange(val)}
                id={requiredField}
                name={requiredField}
                containerClassName={styles.input}
                fixedWidth={false}
                placeholder={t(requiredField)}
              />
              {errors[requiredField] && (
                <span className={styles.errorText}>{errors[requiredField].message}</span>
              )}
            </div>
          )}
        />
      ))}
      <Button htmlType="submit" className={styles.submitButton}>
        {t('submit')}
      </Button>
    </form>
  );
};

export default CompleteSignupForm;
