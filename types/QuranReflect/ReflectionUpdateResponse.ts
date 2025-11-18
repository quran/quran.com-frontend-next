import AyahReflection from './AyahReflection';

import { BaseResponse } from 'types/ApiResponses';

interface ReflectionUpdateResponse extends BaseResponse {
  data: AyahReflection;
}

export default ReflectionUpdateResponse;
