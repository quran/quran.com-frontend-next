import { areArraysEqual } from './array';

export enum ValueType {
  String = 'String',
  Number = 'Number',
  ArrayOfNumbers = 'ArrayOfNumbers',
  ArrayOfStrings = 'ArrayOfStrings',
}

const paramStringValueParser = {
  [ValueType.ArrayOfNumbers]: (paramStringValue: string) =>
    paramStringValue.split(',').map((stringValue) => Number(stringValue)),
  [ValueType.String]: (paramStringValue: string) =>
    paramStringValue.split(',').map((stringValue) => Number(stringValue)),
  [ValueType.Number]: (paramStringValue: string) => Number(paramStringValue),
  [ValueType.String]: (paramStringValue: string) => paramStringValue,
};

export const equalityCheckerByType = {
  [ValueType.ArrayOfNumbers]: areArraysEqual,
  [ValueType.ArrayOfStrings]: areArraysEqual,
  [ValueType.String]: (a, b) => a === b,
  [ValueType.Number]: (a, b) => a === b,
};

export const getQueryParamValueByType = (paramStringValue: string, valueType: ValueType) => {
  const parse = paramStringValueParser[valueType];
  const parsedValue = parse(paramStringValue);
  return parsedValue;
};
