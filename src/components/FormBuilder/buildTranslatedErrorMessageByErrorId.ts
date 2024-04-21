import capitalize from 'lodash/capitalize';
import { Translate } from 'next-translate';

import ErrorMessageId from 'types/ErrorMessageId';

const DEFAULT_ERROR_ID = ErrorMessageId.InvalidField;

const buildTranslatedErrorMessageByErrorId = (
  errorId: ErrorMessageId,
  fieldName: string,
  t: Translate,
  extraParams?: Record<string, unknown>,
) => {
  if (Object.values(ErrorMessageId).includes(errorId)) {
    return t(`common:validation.${errorId}`, { field: capitalize(fieldName), ...extraParams });
  }
  return t(`common:validation.${DEFAULT_ERROR_ID}`, { field: capitalize(fieldName) });
};

export default buildTranslatedErrorMessageByErrorId;
