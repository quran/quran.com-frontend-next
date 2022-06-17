import useTranslation from 'next-translate/useTranslation';
import { Controller, useForm } from 'react-hook-form';

import Button from '../dls/Button/Button';
import Input from '../dls/Forms/Input';

import styles from './FormBuilder.module.scss';

import { buildReactHookFormRules } from 'src/utils/validation';
import FormField from 'types/FormField';

type FormBuilderProps<T> = {
  formFields: FormField[];
  onSubmit: (data: T) => void | Promise<void | { errors: { [key: string]: string } }>;
  actionText?: string;
};
const FormBuilder = <T,>({ formFields, onSubmit, actionText }: FormBuilderProps<T>) => {
  const { handleSubmit, control, setError } = useForm({ mode: 'onBlur' });
  const { t } = useTranslation('common');

  const internalOnSubmit = (data: T) => {
    const onSubmitPromise = onSubmit(data);
    if (onSubmitPromise) {
      onSubmitPromise.then((errorData) => {
        if (errorData && errorData?.errors) {
          Object.entries(errorData.errors).forEach(([field, errorMessage]) => {
            setError(field, { type: 'manual', message: errorMessage as string });
          });
        }
      });
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit(internalOnSubmit)}>
      {formFields?.map((formField) => {
        return (
          <Controller
            key={formField.field}
            control={control}
            rules={buildReactHookFormRules(formField, t)}
            name={formField.field}
            render={({ field, fieldState: { error } }) => (
              <div className={styles.inputContainer}>
                <Input
                  htmlType={formField.type}
                  key={formField.field}
                  onChange={(val) => field.onChange(val)}
                  id={formField.field}
                  name={formField.field}
                  containerClassName={styles.input}
                  fixedWidth={false}
                  placeholder={t(`form.${formField.field}`)}
                />
                {error && <span className={styles.errorText}>{error.message}</span>}
              </div>
            )}
          />
        );
      })}
      <Button htmlType="submit" className={styles.submitButton}>
        {actionText || t('submit')}
      </Button>
    </form>
  );
};

export default FormBuilder;
