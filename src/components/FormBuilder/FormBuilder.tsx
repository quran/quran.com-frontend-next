import classNames from 'classnames';
import { Controller, useForm } from 'react-hook-form';

import Button, { ButtonProps } from '../dls/Button/Button';
import Input from '../dls/Forms/Input';

import buildReactHookFormRules from './buildReactHookFormRules';
import styles from './FormBuilder.module.scss';
import { FormBuilderFormField } from './FormBuilderTypes';

export type SubmissionResult<T> = Promise<void | { errors: { [key in keyof T]: string } }>;
type FormBuilderProps<T> = {
  formFields: FormBuilderFormField[];
  onSubmit: (data: T) => void | SubmissionResult<T>;
  isSubmitting?: boolean;
  actionText: string;
  actionProps?: ButtonProps;
};

const FormBuilder = <T,>({
  formFields,
  onSubmit,
  actionText,
  actionProps = {},
  isSubmitting,
}: FormBuilderProps<T>) => {
  const { handleSubmit, control, setError } = useForm({ mode: 'onBlur' });

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
            defaultValue={formField.defaultValue}
            rules={buildReactHookFormRules(formField)}
            name={formField.field}
            render={({ field, fieldState: { error } }) => {
              return (
                <div className={styles.inputContainer}>
                  <Input
                    htmlType={formField.type}
                    key={formField.field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    id={formField.field}
                    name={formField.field}
                    containerClassName={styles.input}
                    fixedWidth={false}
                    placeholder={formField.label}
                  />
                  {error && <span className={styles.errorText}>{error.message}</span>}
                </div>
              );
            }}
          />
        );
      })}
      <Button
        {...actionProps}
        htmlType="submit"
        isLoading={isSubmitting}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={classNames(styles.submitButton, actionProps.className)}
      >
        {actionText}
      </Button>
    </form>
  );
};

export default FormBuilder;
