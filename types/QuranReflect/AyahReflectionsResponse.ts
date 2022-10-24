import AyahReflection from './AyahReflection';

import { BaseResponse } from 'types/ApiResponses';

interface AyahReflectionsResponse extends BaseResponse {
  posts: AyahReflection[];
}

export default AyahReflectionsResponse;
