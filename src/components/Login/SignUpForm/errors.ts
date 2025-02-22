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

type SignUpErrors = Record<keyof SignUpRequest, string>;

export enum ErrorType {
  MISMATCH = 'mismatch',
  SIGNUP = 'signup',
  API = 'api',
  FORGOT_PASSWORD = 'forgot-password',
  SIGN_IN = 'sign-in',
  RESET_PASSWORD = 'reset-password',
}

const getFormErrors = (t: any, type: ErrorType, apiErrors?: any): { errors: SignUpErrors } => {
  const baseErrors = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  };

  switch (type) {
    case ErrorType.MISMATCH:
      return {
        errors: {
          ...baseErrors,
          confirmPassword: t('errors.confirm'),
        },
      };
    case ErrorType.API:
      return {
        errors: {
          ...baseErrors,
          email: apiErrors?.email
            ? t(apiErrors.email, {
                fieldName: t('common:form.email'),
              })
            : '',
          username: apiErrors?.username
            ? t(apiErrors.username, {
                fieldName: t('common:form.username'),
                min: USERNAME_MIN_LENGTH,
                max: USERNAME_MAX_LENGTH,
              })
            : '',
          password: apiErrors?.password
            ? t(apiErrors.password, {
                fieldName: t('common:form.password'),
                min: PASSWORD_MIN_LENGTH,
                max: PASSWORD_MAX_LENGTH,
              })
            : '',
          confirmPassword: apiErrors?.confirmPassword
            ? t(apiErrors.confirmPassword, {
                fieldName: t('common:form.confirm-password'),
              })
            : '',
          firstName: apiErrors?.firstName
            ? t(apiErrors.firstName, {
                fieldName: t('common:form.firstName'),
                min: NAME_MIN_LENGTH,
                max: NAME_MAX_LENGTH,
              })
            : '',
          lastName: apiErrors?.lastName
            ? t(apiErrors.lastName, {
                fieldName: t('common:form.lastName'),
                min: NAME_MIN_LENGTH,
                max: NAME_MAX_LENGTH,
              })
            : '',
        },
      };
    case ErrorType.SIGNUP:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.signup-failed'),
        },
      };
    case ErrorType.FORGOT_PASSWORD:
      return {
        errors: {
          ...baseErrors,
          email: t('errors.forgot-password-failed'),
        },
      };
    case ErrorType.SIGN_IN:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.signin-failed'),
        },
      };
    case ErrorType.RESET_PASSWORD:
      return {
        errors: {
          ...baseErrors,
          password: t('errors.reset-password-failed'),
        },
      };
    default:
      return { errors: baseErrors };
  }
};

export default getFormErrors;
