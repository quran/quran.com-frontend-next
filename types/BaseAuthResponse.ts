interface BaseAuthResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
    details: Record<string, string>;
  };
  token?: string;
}

export default BaseAuthResponse;
