/* eslint-disable max-lines */
import classNames from 'classnames';
import { Controller, useForm } from 'react-hook-form';

import buildReactHookFormRules from './buildReactHookFormRules';
import styles from './FormBuilder.module.scss';
import { FormBuilderFormField } from './FormBuilderTypes';

import Button, { ButtonProps } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input from '@/dls/Forms/Input';
import StarRating from '@/dls/Forms/StarRating';
import TextArea from '@/dls/Forms/TextArea';
import { FormFieldType } from '@/types/FormField';

export type SubmissionResult<T> = Promise<void | {
  errors?: { [key in keyof T]: string };
  success?: boolean;
}>;
type FormBuilderProps<T> = {
  className?: string;
  formFields: FormBuilderFormField[];
  onSubmit: (data: T) => void | SubmissionResult<T>;
  isSubmitting?: boolean;
  actionText?: string;
  actionProps?: ButtonProps;
  renderAction?: (props: ButtonProps) => React.ReactNode;
  shouldSkipValidation?: boolean;
  /**
   * When true, automatically clears all form fields after successful submission (when the promise resolves without errors).
   * Note: The onSubmit handler must return a promise that resolves with { success: true } for the form to be cleared.
   */
  shouldClearOnSuccess?: boolean;
};

/**
 * {@see https://legacy.reactjs.org/docs/jsx-in-depth.html#choosing-the-type-at-runtime}
 */
const FormFieldTypeToComponentMap = {
  [FormFieldType.TextArea]: TextArea,
  [FormFieldType.Text]: Input,
  [FormFieldType.Password]: Input,
  [FormFieldType.Phone]: Input,
  [FormFieldType.Number]: Input,
  [FormFieldType.Checkbox]: Checkbox,
  [FormFieldType.StarRating]: StarRating,
};

const isFieldTextInput = (type: FormFieldType) => {
  return [
    FormFieldType.Text,
    FormFieldType.Password,
    FormFieldType.Phone,
    FormFieldType.Number,
  ].includes(type);
};

const FormBuilder = <T,>({
  className,
  formFields,
  onSubmit,
  actionText,
  actionProps = {},
  isSubmitting,
  renderAction,
  shouldSkipValidation,
  shouldClearOnSuccess = false,
}: FormBuilderProps<T>) => {
  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { isValid, isDirty },
  } = useForm({ mode: 'onChange' });

  const internalOnSubmit = (data: T) => {
    const onSubmitPromise = onSubmit(data);
    if (onSubmitPromise) {
      onSubmitPromise.then((result) => {
        if (result) {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, errorMessage]) => {
              setError(field, { type: 'manual', message: errorMessage as string });
            });
          } else if (result.success && shouldClearOnSuccess) {
            reset();
          }
        }
      });
    }
  };

  const renderError = (error: any, errorClassName?: string) =>
    error && <span className={classNames(styles.errorText, errorClassName)}>{error.message}</span>;
  const renderExtraSection = (formField: FormBuilderFormField, value: string) => {
    if (!formField.extraSection) return null;
    return typeof formField.extraSection === 'function'
      ? formField.extraSection(value)
      : formField.extraSection;
  };

  const isDisabled = shouldSkipValidation ? isSubmitting : !isDirty || !isValid || isSubmitting;

  return (
    <form
      className={classNames(styles.container, className)}
      onSubmit={handleSubmit(internalOnSubmit)}
      noValidate={shouldSkipValidation}
    >
      {formFields?.map((formField) => {
        return (
          <Controller
            key={formField.field}
            control={control}
            defaultValue={formField.defaultValue}
            rules={buildReactHookFormRules(formField)}
            name={formField.field}
            render={({ field, fieldState: { error } }) => {
              if (formField.customRender) {
                return (
                  <div className={classNames(styles.inputContainer, formField.containerClassName)}>
                    {formField.customRender({
                      value: field.value,
                      onChange: field.onChange,
                      placeholder: formField.placeholder,
                      dataTestId: formField.dataTestId,
                    })}
                    {renderError(error, formField.errorClassName)}
                    {renderExtraSection(formField, field.value)}
                  </div>
                );
              }

              const inputFieldProps = {
                key: formField.field,
                value: field.value,
                id: formField.field,
                name: formField.field,
                containerClassName: formField.containerClassName,
                fieldSetLegend: formField.fieldSetLegend,
                label: formField.label as string,
                placeholder: formField.placeholder,
                dataTestId: formField.dataTestId,
                onChange: (val) => {
                  field.onChange(val);
                  if (formField?.onChange) {
                    formField.onChange(val);
                  }
                },
                ...(isFieldTextInput(formField.type) && {
                  htmlType: formField.type,
                  fixedWidth: false,
                }),
                ...(formField.type === FormFieldType.Checkbox &&
                  typeof formField.checked !== 'undefined' && {
                    checked: formField.checked,
                  }),
              };
              const InputField = FormFieldTypeToComponentMap[formField.type];
              return (
                <div className={classNames(styles.inputContainer, formField.containerClassName)}>
                  <InputField {...inputFieldProps} />
                  {renderError(error, formField.errorClassName)}
                  {renderExtraSection(formField, field.value)}
                </div>
              );
            }}
          />
        );
      })}
      {renderAction ? (
        renderAction({
          htmlType: 'submit',
          isLoading: isSubmitting,
          isDisabled,
          onClick: (e) => {
            e.stopPropagation();
          },
        })
      ) : (
        <Button
          {...actionProps}
          htmlType="submit"
          isLoading={isSubmitting}
          isDisabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={classNames(styles.submitButton, actionProps.className)}
        >
          {actionText}
        </Button>
      )}
    </form>
  );
};

export default FormBuilder;
