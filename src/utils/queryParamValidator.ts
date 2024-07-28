import Alignment from '../../types/Media/Alignment';
import Orientation from '../../types/Media/Orientation';
import QuranFont from '../../types/Media/QuranFont';

export const isValidTranslationsQueryParamValue = (value: string): boolean => {
  const translationIds = value === '' ? [] : value.split(',');
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
    if (translationIds.length > 3) {
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

export const isValidFontStyleQueryParamValue = (value: QuranFont): boolean => {
  return Object.values(QuranFont).includes(value);
};

export const isValidNumberQueryParamValue = (value: string): boolean => {
  return !Number.isNaN(Number(value));
};

export const isValidFontScaleQueryParamValue = (value: string): boolean => {
  const isValidNumber = isValidNumberQueryParamValue(value);
  // 1 and 10 are the ranges of all the valid scales
  return isValidNumber && Number(value) >= 1 && Number(value) <= 10;
};

export const isValidAlignmentQueryParamValue = (value: string): boolean => {
  return Object.values(Alignment).includes(value as Alignment);
};

export const isValidOrientationQueryParamValue = (value: string): boolean => {
  return Object.values(Orientation).includes(value as Orientation);
};

export const isValidOpacityQueryParamValue = (value: number): boolean => {
  const OPACITY_VALUES = [0, 0.2, 0.4, 0.6, 0.8, 1];
  return OPACITY_VALUES.includes(value);
};

export const isValidVideoIdQueryParamValue = (value: string): boolean => {
  const isValidNumber = isValidNumberQueryParamValue(value);
  // 1 and 8 are the ranges of all the valid color ids {@see BACKGROUND_VIDEOS}
  return isValidNumber && Number(value) >= 1 && Number(value) <= 6;
};

export const isValidBorderSizeQueryParamValue = (value: string): boolean => {
  const isValidNumber = isValidNumberQueryParamValue(value);
  // 1 and 5 are the ranges of all the valid scales
  return isValidNumber && Number(value) >= 1 && Number(value) <= 5;
};
