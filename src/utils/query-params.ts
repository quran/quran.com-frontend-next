import { areArraysEqual } from './array';

export enum QueryParamValueType {
  String = 'String',
  Number = 'Number',
  ArrayOfNumbers = 'ArrayOfNumbers',
  ArrayOfStrings = 'ArrayOfStrings',
  Boolean = 'Boolean',
}

export const paramValueParser = {
  [QueryParamValueType.ArrayOfNumbers]: (paramStringValue: string) =>
    paramStringValue === ''
      ? []
      : paramStringValue.split(',').map((stringValue) => Number(stringValue)),
  [QueryParamValueType.ArrayOfStrings]: (paramStringValue: string) =>
    paramStringValue.split(',').map((stringValue) => stringValue),
  [QueryParamValueType.Number]: (paramStringValue: string) => Number(paramStringValue),
  [QueryParamValueType.String]: (paramStringValue: string) => paramStringValue,
  [QueryParamValueType.Boolean]: (paramStringValue: string) => paramStringValue === 'true',
};

export const equalityCheckerByType = {
  [QueryParamValueType.ArrayOfNumbers]: (a, b) => {
    let parsedA = a;
    if (typeof a === 'string') {
      parsedA = a.split(',').map((stringValue) => Number(stringValue));
    }
    return areArraysEqual(parsedA, b);
  },
  [QueryParamValueType.ArrayOfStrings]: (a, b) => {
    let parsedA = a;
    if (typeof a === 'string') {
      parsedA = a.split(',');
    }
    return areArraysEqual(parsedA, b);
  },
  [QueryParamValueType.String]: (a, b) => a === b,
  [QueryParamValueType.Number]: (a, b) => Number(a) === Number(b),
  [QueryParamValueType.Boolean]: (a, b) => Boolean(a) === Boolean(b),
};

export const getQueryParamValueByType = (
  queryParamStringValue: string,
  queryParamValueType: QueryParamValueType,
) => {
  const parse = paramValueParser[queryParamValueType];
  const parsedValue = parse(queryParamStringValue);
  return parsedValue;
};

export const isQueryParamDifferentThanReduxValue = (
  parsedQueryParamValue: string,
  queryParamValueType: QueryParamValueType,
  paramReduxValue: any,
) => {
  const checkEquality = equalityCheckerByType[queryParamValueType];
  return !checkEquality(parsedQueryParamValue, paramReduxValue);
};
