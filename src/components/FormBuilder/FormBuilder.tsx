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

export type SubmissionResult<T> = Promise<void | { errors: { [key in keyof T]: string } }>;
type FormBuilderProps<T> = {
  className?: string;
  formFields: FormBuilderFormField[];
  onSubmit: (data: T) => void | SubmissionResult<T>;
  isSubmitting?: boolean;
  actionText?: string;
  actionProps?: ButtonProps;
  renderAction?: (props: ButtonProps) => React.ReactNode;
  shouldSkipValidation?: boolean;
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
}: FormBuilderProps<T>) => {
  const { handleSubmit, control, setError } = useForm({ mode: 'onChange' });

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

  const renderError = (error: any, errorClassName?: string) =>
    error && <span className={classNames(styles.errorText, errorClassName)}>{error.message}</span>;
  const renderExtraSection = (formField: FormBuilderFormField, value: string) => {
    if (!formField.extraSection) return null;
    return typeof formField.extraSection === 'function'
      ? formField.extraSection(value)
      : formField.extraSection;
  };

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
          onClick: (e) => {
            e.stopPropagation();
          },
        })
      ) : (
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
      )}
    </form>
  );
};

export default FormBuilder;
