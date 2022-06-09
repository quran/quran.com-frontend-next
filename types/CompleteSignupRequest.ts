interface CompleteSignupRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type CompleteSignupRequestKey = keyof CompleteSignupRequest;

export default CompleteSignupRequest;
