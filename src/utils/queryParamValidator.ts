import { Alignment, Orientation } from './media/constants';

export const isValidTranslationsQueryParamValue = (value: string): boolean => {
  // if it's empty string, we shouldn't consider it as a valid translation
  if (!value) {
    return false;
  }
  const translationIds = value.split(',');
  let isValid = true;
  for (let index = 0; index < translationIds.length; index += 1) {
    // if the value is empty
    if (!translationIds[index]) {
      isValid = false;
      break;
    }
    const translationId = Number(translationIds[index]);
    // if the translation Id is empty or is not a number
    if (!translationId && Number.isNaN(translationId)) {
      isValid = false;
      break;
    }
  }
  return isValid;
};

/**
 * Check whether the value of the query param is a valid
 * reciter Id.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isValidReciterId = (value: string): boolean => {
  // if it's empty string, we shouldn't consider it as a valid reciter id
  if (!value) {
    return false;
  }
  const reciterId = Number(value);
  if (reciterId === 0 || Number.isNaN(reciterId)) {
    return false;
  }
  return true;
};

export const isValidBooleanQueryParamValue = (value: string): boolean => {
  return value === 'true' || value === 'false';
};

export const isValidNumberQueryParamValue = (value: string): boolean => {
  return !Number.isNaN(Number(value));
};

export const isValidBackgroundColorIdQueryParamValue = (value: string): boolean => {
  const isValidNumber = isValidNumberQueryParamValue(value);
  // 1 and 8 are the ranges of all the valid color ids {@see getAllBackgrounds}
  return isValidNumber && Number(value) >= 1 && Number(value) <= 8;
};

export const isValidFontScaleQueryParamValue = (value: string): boolean => {
  const isValidNumber = isValidNumberQueryParamValue(value);
  // 1 and 10 are the ranges of all the valid scales
  return isValidNumber && Number(value) >= 1 && Number(value) <= 10;
};

export const isValidAlignmentQueryParamValue = (value: string): boolean => {
  return Alignment[value] !== undefined;
};

export const isValidOrientationQueryParamValue = (value: string): boolean => {
  return Orientation[value] !== undefined;
};
