interface BaseAuthResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
    details: Record<string, string>;
  };
}

export default BaseAuthResponse;
