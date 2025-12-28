/* eslint-disable react-func/max-lines-per-function */
import { UseControllerProps } from 'react-hook-form';

import { FormBuilderFormField } from './FormBuilderTypes';

import { RuleType } from 'types/FieldRule';

/**
 * 1) Check if the formField contains a `required` rule. If so, add a `required` rule to the React Hook Form rules
 * 2) Check if the formField contains `maxLength` or `minLength` rules. If so, create custom validation functions
 *    that validate even when the value is empty
 * 3) Check if the formField contains `regex` rule. If so, try to test the regex against the `value` one by one
 *    if one of test regex test fails, return the error message
 * 4) Check if the formField contains `equal` rule. If so, validate that the field value equals the value of
 *    another field specified in the rule's value property
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
  const minimumLengthRule = formField.rules?.find((rule) => rule.type === RuleType.MinimumLength);
  const regexValidations = formField.rules?.filter((rule) => rule.type === RuleType.Regex);
  const equalRule = formField.rules?.find((rule) => rule.type === RuleType.Equal);

  // Use custom validation functions for length rules to ensure they validate even when value is empty
  // Validation functions receive the value and entire form values object
  const validateObject: Record<
    string,
    (value: string, formValues?: Record<string, any>) => string | true
  > = {};

  if (maximumLengthRule) {
    const maxLength = maximumLengthRule.value as number;
    validateObject.maxLength = (value: string) => {
      // Convert to string and check length, even if empty
      const stringValue = String(value ?? '');
      if (
        stringValue.length > maxLength ||
        (!stringValue.length && formField.shouldShowValidationErrors)
      ) {
        return maximumLengthRule.errorMessage || '';
      }
      return true;
    };
  }

  if (minimumLengthRule) {
    const minLength = minimumLengthRule.value as number;
    validateObject.minLength = (value: string) => {
      // Convert to string and check length, even if empty
      const stringValue = String(value ?? '');
      if (stringValue.length < minLength) {
        return minimumLengthRule.errorMessage || '';
      }
      return true;
    };
  }

  // if contains a rule with type `regex`
  if (regexValidations && regexValidations.length > 0) {
    // Create separate validation functions for each regex rule
    // This allows react-hook-form to track each regex validation separately
    // when criteriaMode is set to 'all', enabling all validation errors to be displayed
    regexValidations.forEach((rule, index) => {
      // Use the rule's name if provided, otherwise generate a unique name
      const validationName = rule.name || `regex_${index}`;
      validateObject[validationName] = (value: string) => {
        const regex = new RegExp(rule.value as string);
        const isTestSucceed = regex.test(value);
        if (!isTestSucceed) {
          return rule.errorMessage;
        }
        return true;
      };
    });
  }

  // if contains a rule with type `equal`
  if (equalRule) {
    const targetFieldName = equalRule.value as string;
    validateObject.equal = (value: string, formValues: Record<string, any>) =>
      value === formValues[targetFieldName] ? true : equalRule.errorMessage || '';
    rules.deps = [targetFieldName];
  }

  // Only set validate if we have any custom validations
  if (Object.keys(validateObject).length > 0) {
    rules.validate = validateObject;
  }

  return rules;
};

export default buildReactHookFormRules;
