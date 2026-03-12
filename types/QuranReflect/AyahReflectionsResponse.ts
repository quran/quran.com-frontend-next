import AyahReflection from './AyahReflection';
import QuranReflectPagination from './QuranReflectPagination';

import { BaseResponse } from 'types/ApiResponses';

export type ReflectionReference = { chapterId: number; from: number; to: number };

interface AyahReflectionsResponse extends BaseResponse, QuranReflectPagination {
  data: AyahReflection[];
}

export default AyahReflectionsResponse;
