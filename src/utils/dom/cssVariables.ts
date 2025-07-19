/**
 * Get CSS variable value as a number
 * @param {string} variableName - Name of the CSS variable
 * @param {number} fallbackValue - Fallback value if the variable is not found
 * @returns {number} The CSS variable value as a number
 */
export const getCSSVariableValue = (variableName: string, fallbackValue: number): number => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  if (!value) return fallbackValue;
  return parseInt(value, 10);
};

/**
 * Get CSS variable value as a string
 * @param {string} variableName - Name of the CSS variable
 * @param {string} fallbackValue - Fallback value if the variable is not found
 * @returns {string} The CSS variable value as a string
 */
export const getCSSVariableValueAsString = (
  variableName: string,
  fallbackValue: string,
): string => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallbackValue;
};
