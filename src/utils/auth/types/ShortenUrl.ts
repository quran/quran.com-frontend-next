import { BaseResponse } from '@/types/ApiResponses';

export interface ShortenUrlResponse extends BaseResponse {
  id: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}
