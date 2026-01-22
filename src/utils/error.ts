import { BaseResponse } from 'types/ApiResponses';

// eslint-disable-next-line import/prefer-default-export
export const throwIfError = (res: BaseResponse) => {
  if (res.status === 500) {
    throw new Error('internal server error');
  }
};

export interface APIErrorResponse {
  details: {
    error: {
      code: string;
      details: Record<string, string>;
    };
  };
}

export const isValidationError = (response: unknown): response is APIErrorResponse => {
  if (typeof response !== 'object' || response === null) return false;
  const error = response as APIErrorResponse;
  const detailsError = error.details?.error;

  return detailsError?.code === 'ValidationError' && !!detailsError?.details;
};
