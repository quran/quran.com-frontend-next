import capitalize from 'lodash/capitalize';
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
      onSubmitPromise.then(({ errors }) => {
        if (errors) {
          Object.entries(errors).forEach(([field, errorMessage]) => {
            setError(field, { type: 'manual', message: errorMessage as string });
          });
        }
      });
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit(internalOnSubmit)}>
      {formFields?.map((requiredField) => {
        return (
          <Controller
            key={requiredField.field}
            control={control}
            rules={buildReactHookFormRules(requiredField, t)}
            name={requiredField.field}
            render={({ field, fieldState: { error } }) => (
              <div className={styles.inputContainer}>
                <Input
                  key={requiredField.field}
                  onChange={(val) => field.onChange(val)}
                  id={requiredField.field}
                  name={requiredField.field}
                  containerClassName={styles.input}
                  fixedWidth={false}
                  placeholder={t(capitalize(requiredField.field))}
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
