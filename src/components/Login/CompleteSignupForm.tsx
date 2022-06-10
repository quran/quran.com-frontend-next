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

const fieldHtmlType: { [key in ProfileRequiredFields]: string } = {
  firstName: 'text',
  lastName: 'text',
  email: 'email',
};

const fieldPattern: Record<string, RegExp> = {
  email: EMAIL_VALIDATION_REGEX,
};

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ requiredFields }) => {
  const { handleSubmit, control } = useForm<CompleteSignupRequest>();
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
      {requiredFields?.map((requiredField) => {
        const capitalizedFieldName = capitalize(requiredField);
        return (
          <Controller
            key={requiredField}
            control={control}
            name={requiredField}
            rules={{
              required: {
                message: t('validation.required', { field: capitalizedFieldName }),
                value: true,
              },
              ...(fieldPattern[requiredField] && {
                pattern: {
                  value: fieldPattern[requiredField],
                  message: t(`validation.${requiredField}`, { field: capitalizedFieldName }),
                },
              }),
            }}
            render={({ field, fieldState: { error } }) => (
              <div className={styles.inputContainer}>
                <Input
                  htmlType={fieldHtmlType[requiredField]}
                  key={requiredField}
                  onChange={(val) => field.onChange(val)}
                  id={requiredField}
                  name={requiredField}
                  containerClassName={styles.input}
                  fixedWidth={false}
                  placeholder={t(requiredField)}
                />
                {error && <span className={styles.errorText}>{error.message}</span>}
              </div>
            )}
          />
        );
      })}
      <Button htmlType="submit" className={styles.submitButton}>
        {t('submit')}
      </Button>
    </form>
  );
};

export default CompleteSignupForm;
