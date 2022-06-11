import useTranslation from 'next-translate/useTranslation';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import styles from './CompleteSignupForm.module.scss';

import Button from 'src/components/dls/Button/Button';
import Input from 'src/components/dls/Forms/Input';
import { completeSignup } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import { buildReactHookFormRules } from 'src/utils/validation';
import CompleteSignupRequest, { ProfileRequiredFields } from 'types/CompleteSignupRequest';
import FormField from 'types/FormField';

type CompleteSignupFormProps = {
  requiredFields: FormField[];
};

// TODO: extract this component into a `<FormBuilder>` component
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
        return (
          <Controller
            key={requiredField.field}
            control={control}
            rules={buildReactHookFormRules(requiredField, t)}
            name={requiredField.field as ProfileRequiredFields}
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
