/* eslint-disable import/prefer-default-export */
/**
 * Check whether the reflection is RTL or LTR.
 *
 * @param {string} language
 * @returns {boolean}
 */
export const isRTLReflection = (language: string): boolean => {
  switch (language) {
    case 'ARABIC':
    case 'URDU':
      return true;

    default:
      return false;
  }
};
