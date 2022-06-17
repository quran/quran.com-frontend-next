interface CompleteSignupRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  verificationCode?: string;
}

export type ProfileRequiredFields = keyof CompleteSignupRequest;

export default CompleteSignupRequest;
