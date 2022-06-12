import ErrorMessageId from './ErrorMessageId';

export enum RuleType {
  Required = 'required',
  Regex = 'regex',
}

type RuleValue = string | boolean;
type FieldRule = {
  type: RuleType;
  value: RuleValue;
  errorId?: ErrorMessageId;
};

export default FieldRule;
