/**
 * Omit specified keys from an object.
 *
 * @template T - The type of the input object
 * @template K - The keys to omit (as a readonly array)
 * @param {T} obj - The object to omit keys from
 * @param {K} keys - The keys to omit
 * @returns {Omit<T, K[number]>} A new object without the specified keys
 *
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['a', 'c']) // returns { b: 2 }
 */
const omit = <T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> => {
  const result = { ...obj };

  keys.forEach((key) => {
    delete result[key as keyof T];
  });

  return result;
};

export default omit;
