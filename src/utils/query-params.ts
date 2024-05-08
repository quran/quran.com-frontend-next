import { areArraysEqual } from './array';

export enum QueryParamValueType {
  String = 'String',
  Number = 'Number',
  ArrayOfNumbers = 'ArrayOfNumbers',
  ArrayOfStrings = 'ArrayOfStrings',
  Boolean = 'Boolean',
}

const paramValueParser = {
  [QueryParamValueType.ArrayOfNumbers]: (paramStringValue: string) =>
    paramStringValue.split(',').map((stringValue) => Number(stringValue)),
  [QueryParamValueType.ArrayOfStrings]: (paramStringValue: string) =>
    paramStringValue.split(',').map((stringValue) => stringValue),
  [QueryParamValueType.Number]: (paramStringValue: string) => Number(paramStringValue),
  [QueryParamValueType.String]: (paramStringValue: string) => paramStringValue,
  [QueryParamValueType.Boolean]: (paramStringValue: string) => Boolean(paramStringValue),
};

export const equalityCheckerByType = {
  [QueryParamValueType.ArrayOfNumbers]: areArraysEqual,
  [QueryParamValueType.ArrayOfStrings]: areArraysEqual,
  [QueryParamValueType.String]: (a, b) => a === b,
  [QueryParamValueType.Number]: (a, b) => a === b,
  [QueryParamValueType.Boolean]: (a, b) => a === b,
};

export const getQueryParamValueByType = (
  paramStringValue: string,
  valueType: QueryParamValueType,
) => {
  const parse = paramValueParser[valueType];
  const parsedValue = parse(paramStringValue);
  return parsedValue;
};
