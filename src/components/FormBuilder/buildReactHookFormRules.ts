/* eslint-disable react-func/max-lines-per-function */
import { UseControllerProps } from 'react-hook-form';

import { FormBuilderFormField } from './FormBuilderTypes';

import { RuleType } from 'types/FieldRule';

/**
 * 1) Check if the formField contains a `required` rule. If so, add a `required` rule to the React Hook Form rules
 * 2) Check if the formField contains `regex` rule. If so, try to test the regex against the `value` one by one
 *    if one of test regex test fails, return the error message
 *
 * Note: The error message returned by this function is already translated using `t(validation.$errorId)`
 *
 * @param {FormField} formField
 * @returns {UseControllerProps['rules']} rules
 */
const buildReactHookFormRules = (formField: FormBuilderFormField) => {
  const rules: UseControllerProps['rules'] = {};

  const requiredRule = formField.rules?.find(
    (rule) => rule.type === RuleType.Required && rule.value === true,
  );

  // if contains a rule with type `required`
  if (requiredRule) {
    rules.required = {
      message: requiredRule.errorMessage,
      value: true,
    };
  }

  const maximumLengthRule = formField.rules?.find((rule) => rule.type === RuleType.MaximumLength);
  if (maximumLengthRule) {
    rules.maxLength = {
      message: maximumLengthRule.errorMessage,
      value: maximumLengthRule.value as number,
    };
  }

  const minimumLength = formField.rules?.find((rule) => rule.type === RuleType.MinimumLength);
  if (minimumLength) {
    rules.minLength = {
      message: minimumLength.errorMessage,
      value: minimumLength.value as number,
    };
  }

  const regexValidations = formField.rules?.filter((rule) => rule.type === RuleType.Regex);

  // if contains a rule with type `regex`
  if (regexValidations && regexValidations.length > 0) {
    rules.validate = {
      regex: (value) => {
        const failedRule = regexValidations.find((rule) => {
          const regex = new RegExp(rule.value as string);
          const isTestSucceed = regex.test(value);
          return !isTestSucceed;
        });

        if (failedRule) return failedRule.errorMessage;

        return null;
      },
    };
  }

  return rules;
};

export default buildReactHookFormRules;
