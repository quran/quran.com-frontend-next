/**
 * Get CSS variable value as a number
 * @param {string} variableName - Name of the CSS variable
 * @param {number} fallbackValue - Fallback value if the variable is not found
 * @returns {number} The CSS variable value as a number
 */
export const getCSSVariableValue = (variableName: string, fallbackValue: number): number => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  if (!value) return fallbackValue;

  // Parse the value, removing any non-numeric characters (like 'px', 'em', etc.)
  const parsed = parseInt(value, 10);

  // Return fallback if parsing resulted in NaN
  return Number.isNaN(parsed) ? fallbackValue : parsed;
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
