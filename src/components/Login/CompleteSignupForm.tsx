import capitalize from 'lodash/capitalize';
import useTranslation from 'next-translate/useTranslation';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import styles from './CompleteSignupForm.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import CompleteSignupRequest, { ProfileRequiredFields } from 'types/CompleteSignupRequest';
import FormField from 'types/FormField';

type CompleteSignupFormProps = {
  requiredFields: FormField[];
};

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ requiredFields }) => {
  const { handleSubmit, control } = useForm<CompleteSignupRequest>({ mode: 'onBlur' });
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
        const capitalizedFieldName = capitalize(requiredField.field);
        return (
          <Controller
            key={requiredField.field}
            control={control}
            name={requiredField.field as ProfileRequiredFields}
            rules={{
              required: requiredField.isRequired
                ? {
                    message: t('validation.required', { field: capitalizedFieldName }),
                    value: true,
                  }
                : null,
              ...(requiredField.pattern
                ? {
                    pattern: {
                      value: new RegExp(requiredField.pattern.value),
                      message: t(`validation.${requiredField.pattern.messageId}`, {
                        field: capitalizedFieldName,
                      }),
                    },
                  }
                : {}),
            }}
            render={({ field, fieldState: { error } }) => (
              <div className={styles.inputContainer}>
                <Input
                  key={requiredField.field}
                  onChange={(val) => field.onChange(val)}
                  id={requiredField.field}
                  name={requiredField.field}
                  containerClassName={styles.input}
                  fixedWidth={false}
                  placeholder={t(requiredField.field)}
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
