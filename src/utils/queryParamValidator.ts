/* eslint-disable import/prefer-default-export */

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
