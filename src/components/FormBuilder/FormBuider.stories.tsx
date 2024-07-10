/* eslint-disable no-console */
/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
/* eslint-disable no-alert */

import FormBuilder from './FormBuilder';

import { EMAIL_VALIDATION_REGEX } from '@/utils/validation';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

export default {
  title: 'dls/FormBuilder',
  component: FormBuilder,
  argTypes: {
    formFields: {},
  },
};

export const FormExample = () => {
  return (
    <FormBuilder
      formFields={[
        {
          field: 'name',
          placeholder: 'Name',
          type: FormFieldType.Text,
        },
      ]}
      actionText="Submit"
      onSubmit={(data) => {
        console.log(data);
      }}
    />
  );
};

export const WithRequiredField = () => {
  return (
    <FormBuilder
      formFields={[
        {
          field: 'name',
          placeholder: 'Name',
          type: FormFieldType.Text,
          rules: [{ type: RuleType.Required, value: true, errorMessage: 'name is required' }],
        },
      ]}
      actionText="Submit"
      onSubmit={(data) => {
        console.log(data);
      }}
    />
  );
};

export const WithStarRating = () => {
  return (
    <FormBuilder
      formFields={[
        {
          defaultValue: '5',
          field: 'rating',
          type: FormFieldType.StarRating,
        },
      ]}
      actionText="Submit"
      onSubmit={(data) => {
        console.log(data);
      }}
    />
  );
};

export const WithEmailValidation = () => {
  return (
    <FormBuilder
      formFields={[
        {
          field: 'email',
          type: FormFieldType.Text,
          placeholder: 'Email',
          rules: [
            { type: RuleType.Required, value: true, errorMessage: 'email is required' },
            {
              type: RuleType.Regex,
              value: EMAIL_VALIDATION_REGEX.source,
              errorMessage: 'email is invalid',
            },
          ],
        },
      ]}
      actionText="Submit"
      onSubmit={(data) => {
        console.log(data);
      }}
    />
  );
};

export const WithFailedOnSubmit = () => {
  return (
    <FormBuilder
      formFields={[
        {
          field: 'code',
          placeholder: 'Verification Code',
          type: FormFieldType.Text,
          rules: [{ type: RuleType.Required, value: true, errorMessage: 'code is required' }],
        },
      ]}
      actionText="Submit"
      onSubmit={() => {
        return Promise.resolve({ errors: { code: 'Verification code is expired' } });
      }}
    />
  );
};
