import { privateFetcher } from './api';
import {
  makeCompleteSignupUrl,
  makeForgotPasswordUrl,
  makeResetPasswordUrl,
  makeSignInUrl,
  makeSignUpUrl,
} from './apiPaths';
import mapAPIErrorToFormFields, { AuthEndpoint } from './errors';

import SignUpRequest from '@/types/auth/SignUpRequest';
import BaseAuthResponse from '@/types/BaseAuthResponse';
import CompleteSignupRequest from '@/types/CompleteSignupRequest';

const CONTENT_TYPE = 'Content-Type';

interface APIResponse<T> {
  data: T;
  errors: Record<string, string>;
}

interface AuthFieldMap {
  [key: string]: string;
}

/**
 * Generic function to handle auth requests
 * @returns {Promise<APIResponse<BaseAuthResponse>>} Promise containing the API response and mapped error fields
 */
const handleAuthRequest = async <T>(
  url: string,
  data: T,
  endpoint: AuthEndpoint,
  fieldMap: AuthFieldMap,
): Promise<APIResponse<BaseAuthResponse>> => {
  const response = await privateFetcher<BaseAuthResponse>(url, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE]: 'application/json',
    },
    body: JSON.stringify(data),
  });

  return {
    data: response,
    errors: await mapAPIErrorToFormFields(response, {
      endpoint,
      fieldMap,
    }),
  };
};

/**
 * Sign in request handler
 * @returns {Promise<APIResponse<BaseAuthResponse>>} Promise containing the authentication response and any validation errors
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<APIResponse<BaseAuthResponse>> => {
  return handleAuthRequest(makeSignInUrl(), { email, password }, AuthEndpoint.SignIn, {
    credentials: 'password',
    email: 'email',
  });
};

/**
 * Sign up request handler
 * @returns {Promise<APIResponse<BaseAuthResponse>>} Promise containing the authentication response and any validation errors
 */
export const signUp = async (data: SignUpRequest): Promise<APIResponse<BaseAuthResponse>> => {
  return handleAuthRequest(makeSignUpUrl(), data, AuthEndpoint.SignUp, {
    email: 'email',
    password: 'password',
    confirmPassword: 'confirmPassword',
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
  });
};

export const requestPasswordReset = async (
  email: string,
): Promise<APIResponse<BaseAuthResponse>> => {
  return handleAuthRequest(makeForgotPasswordUrl(), { email }, AuthEndpoint.ForgotPassword, {
    email: 'email',
  });
};

export const completeSignup = async (
  data: CompleteSignupRequest,
): Promise<APIResponse<BaseAuthResponse>> => {
  return handleAuthRequest(makeCompleteSignupUrl(), data, AuthEndpoint.CompleteSignup, {
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    username: 'username',
  });
};

export const resetPassword = async (
  password: string,
  token: string,
): Promise<APIResponse<BaseAuthResponse>> => {
  return handleAuthRequest(
    makeResetPasswordUrl(),
    { password, token },
    AuthEndpoint.ResetPassword,
    {
      password: 'password',
      token: 'token',
    },
  );
};
