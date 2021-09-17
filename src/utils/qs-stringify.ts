// Reference: https://github.com/billjs/query-string/blob/master/src/index.ts

type Primitive = string | number | boolean;
type QueryObject = Record<string, Primitive | undefined | null>;

function isObject(obj: QueryObject) {
  const type = typeof obj;
  return (obj && (type === 'object' || type === 'function')) || false;
}

/**
 * Given an object of query string, return the query string
 * example:
 * {a: 1, b: 2} => 'a=1&b=2'
 * check qs-stringify.test.ts for more examples
 *
 * Note: this function only supports primitive values,
 * so, it doesn't work with array and object
 *
 * @param {Object} obj
 * @param {string} sep
 * @param {string} eq
 * @returns {string}
 */
export default function stringify(obj: QueryObject, sep = '&', eq = '=') {
  if (obj == null || !isObject(obj)) return '';

  return Object.entries(obj)
    .map(([key, value]) => {
      if (!value) return '';
      return [encodeURIComponent(key), encodeURIComponent(value)].join(eq);
    })
    .join(sep);
}
