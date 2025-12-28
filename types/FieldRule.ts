import ErrorMessageId from './ErrorMessageId';

export enum RuleType {
  Required = 'required',
  Regex = 'regex',
  MaximumLength = 'maxLength',
  MinimumLength = 'minLength',
  Equal = 'equal',
}

type RuleValue = string | boolean | number;
type FieldRule = {
  name?: string;
  type: RuleType;
  value: RuleValue;
  errorId?: ErrorMessageId;
  errorMessage?: string;
  errorExtraParams?: Record<string, unknown>;
};

export default FieldRule;
