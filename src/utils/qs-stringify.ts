// Reference: https://github.com/billjs/query-string/blob/master/src/index.ts

type QueryObject = Record<string, any>;
export type StringifyFunction = (key: string, value: any) => any;
type Config = {
  eq?: string;
  sep?: string;
  fn?: StringifyFunction;
  prefix?: string;
};

const defaultStringifyFunction: StringifyFunction = (key: string, value: any) => value;
const defaultEq = '=';
const defaultSep = '&';
const defaultConfig: Config = {
  eq: defaultEq,
  sep: defaultSep,
  prefix: '',
  fn: defaultStringifyFunction,
};

/**
 * Given a query object, return the query string
 * See qs-stringify.test.ts for examples
 *
 * @param {QueryObject} obj a query object to be converted to a query string
 * @param {Config} config optional configuration
 * @returns {string} query string
 *
 * @example
 * stringify({a: 1, b: 2}) // returns 'a=1&b=s'
 */
function stringify(obj: QueryObject, config = defaultConfig): string {
  const { eq, sep, fn, prefix } = { ...defaultConfig, ...config };
  if (obj == null || !isObject(obj)) {
    return '';
  }

  return Object.entries(obj)
    .filter(([, value]) => value !== null) // filter out null values
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return encode(key, value.join(','), { eq, fn, prefix });
      }

      if (isObject(value)) {
        return stringify(value, { eq, sep, fn, prefix: getKey(key, prefix) });
      }
      return encode(key, value, { eq, fn, prefix });
    })
    .join(sep);
}

// encode the key and add prefix if necessary
const getKey = (key: string, prefix = ''): string => {
  const encodedKey = encodeURIComponent(key);
  if (prefix) return `${prefix}[${encodedKey}]`;
  return encodedKey;
};

// encode the key and value of a query object
const encode = (
  key: string,
  value: any,
  { eq = defaultEq, fn = defaultStringifyFunction, prefix = '' },
): string => {
  const newValue = encodeURIComponent(fn(key, value));
  const newKey = getKey(key, prefix);

  return [newKey, newValue].join(eq);
};

// check if the given value is an object
function isObject(obj: QueryObject) {
  const type = typeof obj;
  return (obj && (type === 'object' || type === 'function')) || false;
}

export default stringify;
