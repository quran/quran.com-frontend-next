/* eslint-disable unicorn/no-array-reduce */
// Reference: https://github.com/billjs/query-string/blob/master/src/index.ts

type QueryObject = Record<string, any>;

function isObject(obj: QueryObject) {
  const type = typeof obj;
  return (obj && (type === 'object' || type === 'function')) || false;
}

/**
 * Given an object, return the query string
 * example:
 * {a: 1, b: 2} => 'a=1&b=2'
 * check qs-stringify.test.ts for more examples
 *
 * @param {Object} obj
 * @param {string} sep
 * @param {string} eq
 * @returns {string}
 */
export default function stringify(obj: QueryObject, sep = '&', eq = '=') {
  if (obj == null || !isObject(obj)) return '';

  return Object.entries(obj)
    .reduce((acc, [key, value]) => {
      if (!value) return acc;

      const qs = [encodeURIComponent(key), encodeURIComponent(value)].join(eq);
      return [...acc, qs];
    }, [])
    .join(sep);
}
