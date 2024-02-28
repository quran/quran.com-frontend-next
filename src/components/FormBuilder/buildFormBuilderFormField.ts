import capitalize from 'lodash/capitalize';
import { Translate } from 'next-translate';

import { FormBuilderFormField } from './FormBuilderTypes';

import FormField, { FormFieldType } from 'types/FormField';

/**
 * Transform FormField to be FormBuilderFormField
 *
 * FormField and FormBuilderFormField are the same except, FormBuilderFormField is not tied to errorId and translationId
 *   - Previously FormBuilder was tied to common.json, next-translate.
 *   - and it's also tied to ErrorMessageId
 *   - and the `label` is also less flexible because it's tied to `field` value
 *
 * This function help to transform FormField to FormBuilderFormField for common use case.
 * But when we need a more flexible use case, we can use FormBuilderFormField directly. Without using this helper function
 *
 * check ./FormBuilderTypes.ts for more info
 *
 * Note that this function expect the `t` translate function to be used with `common.json`. And expect `form.$field`  and `validation.$errorId` to exist.
 *
 * @param {FormField} formField
 * @returns {FormBuilderFormField} formBuilderFormField
 */
const buildFormBuilderFormField = (formField: FormField, t: Translate): FormBuilderFormField => {
  return {
    ...formField,
    ...(formField.rules && {
      rules: formField.rules.map((rule) => ({
        type: rule.type,
        value: rule.value,
        errorMessage: t(`common:validation.${rule.errorId}`, {
          field: capitalize(formField.field),
          ...rule.errorExtraParams,
        }),
      })),
    }),
    ...(formField.label && {
      label:
        formField.type === FormFieldType.Checkbox ? formField.label : t(`form.${formField.label}`),
    }),
    ...(formField.defaultValue && { defaultValue: formField.defaultValue }),
    ...(formField.placeholder && { placeholder: formField.placeholder }),
  };
};

export default buildFormBuilderFormField;
