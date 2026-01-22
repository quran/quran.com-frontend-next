import { completeSignup, requestVerificationCode } from './api';
import { makeUserProfileUrl } from './apiPaths';

/**
 * Handles the verification code submission process
 *
 * @param {string} email User's email address
 * @param {string} verificationCode Verification code entered by the user
 * @returns {object} The response from the completeSignup API and profile URL
 * @throws Error if email is missing or verification code is invalid
 */
export const handleVerificationCodeSubmit = async (email: string, verificationCode: string) => {
  if (!email) {
    throw new Error('Email is required');
  }

  const response = await completeSignup({ email, verificationCode });
  if (!response) {
    throw new Error('Invalid verification code');
  }

  return {
    response,
    profileUrl: makeUserProfileUrl(),
  };
};

/**
 * Handles resending verification code to the user's email
 *
 * @param {string} email User's email address
 * @throws Error if email is missing
 * @returns {Promise<any>} The response from the requestVerificationCode API
 */
export const handleResendVerificationCode = async (email: string) => {
  if (!email) {
    throw new Error('Email is required');
  }

  return requestVerificationCode(email);
};
