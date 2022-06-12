import capitalize from 'lodash/capitalize';
import { Translate } from 'next-translate';
import { UseControllerProps } from 'react-hook-form';

import ErrorMessageId from 'types/ErrorMessageId';
import FieldRule, { RuleType } from 'types/FieldRule';
import FormField from 'types/FormField';

export const EMAIL_VALIDATION_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * 1) Check if the formField contains a `required` rule. If so, add a `required` rule to the React Hook Form rules
 * 2) Check if the formField contains `regex` rule. If so, try to test the regex against the `value` one by one
 *    if one of test regex test fails, return the error message
 *
 * Note: The error message returned by this function is already translated using `t(validation.$errorId)`
 *
 * @param {FormField} formField
 * @param {Translate} t
 * @returns {UseControllerProps['rules']} rules
 */
export const buildReactHookFormRules = (formField: FormField, t: Translate) => {
  const rules: UseControllerProps['rules'] = {};

  const requiredRule = formField.rules?.find(
    (rule) => rule.type === RuleType.Required && rule.value === true,
  );

  // if contains a rule with type `required`
  if (requiredRule) {
    rules.required = {
      message: buildTranslatedErrorMessage(requiredRule, t, formField.field),
      value: true,
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

        if (failedRule) return buildTranslatedErrorMessage(failedRule, t, formField.field);

        return false;
      },
    };
  }

  return rules;
};

const DEFAULT_ERROR_ID = ErrorMessageId.InvalidField;
const buildTranslatedErrorMessage = (rule: FieldRule, t: Translate, fieldName: string) => {
  if (Object.values(ErrorMessageId).includes(rule.errorId)) {
    return t(`validation.${rule.errorId}`, { field: capitalize(fieldName) });
  }
  return t(`validation.${DEFAULT_ERROR_ID}`, { field: capitalize(fieldName) });
};
