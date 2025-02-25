interface SignUpRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  verificationCode?: string;
}

export default SignUpRequest;
