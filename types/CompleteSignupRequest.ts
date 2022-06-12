interface CompleteSignupRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type ProfileRequiredFields = keyof CompleteSignupRequest;

export default CompleteSignupRequest;
