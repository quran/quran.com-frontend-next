import capitalize from 'lodash/capitalize';
import { TFunction } from 'next-i18next';

import ErrorMessageId from 'types/ErrorMessageId';

const DEFAULT_ERROR_ID = ErrorMessageId.InvalidField;

const buildTranslatedErrorMessageByErrorId = (
  errorId: ErrorMessageId,
  fieldName: string,
  t: TFunction,
) => {
  if (Object.values(ErrorMessageId).includes(errorId)) {
    return t(`validation.${errorId}`, { field: capitalize(fieldName) });
  }
  return t(`validation.${DEFAULT_ERROR_ID}`, { field: capitalize(fieldName) });
};

export default buildTranslatedErrorMessageByErrorId;
