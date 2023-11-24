import ErrorMessageId from './ErrorMessageId';

export enum RuleType {
  Required = 'required',
  Regex = 'regex',
  MaximumLength = 'maxLength',
  MinimumLength = 'minLength',
}

type RuleValue = string | boolean | number;
type FieldRule = {
  type: RuleType;
  value: RuleValue;
  errorId?: ErrorMessageId;
  errorMessage?: string;
  errorExtraParams?: Record<string, unknown>;
};

export default FieldRule;
