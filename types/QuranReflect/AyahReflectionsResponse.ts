import AyahReflection from './AyahReflection';

import { BaseResponse } from 'types/ApiResponses';

export type ReflectionReference = { chapterId: number; from: number; to: number };

interface AyahReflectionsResponse extends BaseResponse {
  data: AyahReflection[];
}

export default AyahReflectionsResponse;
