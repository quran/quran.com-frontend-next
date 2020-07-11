export const apiUrl = 'http://api.quran.com/api/v3';

/**
 * Generates a url to make an api call to our backend
 * @param path the path for the call
 * @param parameters optional query params, {a: 1, b: 2} is parsed to "?a=1&b=2"
 */
export const makeUrl = (path: string, parameters?: Record<string, unknown>) => {
  if (!parameters) {
    return `${apiUrl}${path}`;
  }

  // The following section parses the query params for convenience
  // E.g. parses {a: 1, b: 2} to "?a=1&b=2"
  const parametersStringified = JSON.stringify(parameters);
  const formattedParameters = JSON.parse(
    parametersStringified,
    (key, val) => (typeof val !== 'object' && val !== null ? String(val) : val), // Converts the value to a string in each key/value pair
  );

  const queryParameters = `?${new URLSearchParams(formattedParameters).toString()}`;
  return `${apiUrl}${path}${queryParameters}`;
};
