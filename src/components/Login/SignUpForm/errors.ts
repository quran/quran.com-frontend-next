/* eslint-disable react-func/max-lines-per-function */
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../SignUpFormFields/consts';

import SignUpRequest from '@/types/auth/SignUpRequest';

type AuthErrors = Record<keyof SignUpRequest, string>;

export enum ErrorType {
  MISMATCH = 'mismatch',
  SIGNUP = 'signup',
  API = 'api',
  FORGOT_PASSWORD = 'forgot-password',
  SIGN_IN = 'sign-in',
  RESET_PASSWORD = 'reset-password',
}

const getFormErrors = (t: any, type: ErrorType, apiErrors?: any): { errors: AuthErrors } => {
  const baseErrors = {};

  switch (type) {
    case ErrorType.MISMATCH:
      return {
        errors: {
          ...baseErrors,
          confirmPassword: t('errors.confirm'),
        } as AuthErrors,
      };
    case ErrorType.API: {
      const errors: Partial<AuthErrors> = { ...baseErrors };

      if (apiErrors?.email) {
        errors.email = t(apiErrors.email, {
          fieldName: t('common:form.email'),
        });
      }

      if (apiErrors?.username) {
        errors.username = t(apiErrors.username, {
          fieldName: t('common:form.username'),
          min: USERNAME_MIN_LENGTH,
          max: USERNAME_MAX_LENGTH,
        });
      }

      if (apiErrors?.password) {
        errors.password = t(apiErrors.password, {
          fieldName: t('common:form.password'),
          min: PASSWORD_MIN_LENGTH,
          max: PASSWORD_MAX_LENGTH,
        });
      }

      if (apiErrors?.confirmPassword) {
        errors.confirmPassword = t(apiErrors.confirmPassword, {
          fieldName: t('common:form.confirm-password'),
        });
      }

      if (apiErrors?.firstName) {
        errors.firstName = t(apiErrors.firstName, {
          fieldName: t('common:form.firstName'),
          min: NAME_MIN_LENGTH,
          max: NAME_MAX_LENGTH,
        });
      }

      if (apiErrors?.lastName) {
        errors.lastName = t(apiErrors.lastName, {
          fieldName: t('common:form.lastName'),
          min: NAME_MIN_LENGTH,
          max: NAME_MAX_LENGTH,
        });
      }

      return { errors: errors as AuthErrors };
    }
    case ErrorType.SIGNUP:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.signup-failed'),
        } as AuthErrors,
      };
    case ErrorType.FORGOT_PASSWORD:
      return {
        errors: {
          ...baseErrors,
          email: t('errors.forgot-password-failed'),
        } as AuthErrors,
      };
    case ErrorType.SIGN_IN:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.signin-failed'),
        } as AuthErrors,
      };
    case ErrorType.RESET_PASSWORD:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.reset-password-failed'),
        } as AuthErrors,
      };
    default:
      return { errors: baseErrors as AuthErrors };
  }
};

export default getFormErrors;
