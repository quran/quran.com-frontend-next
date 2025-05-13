import { Question } from './Question';

import { BaseResponse } from 'types/ApiResponses';

type AyahQuestionsResponse = {
  questions: Question[];
  totalCount: number;
} & BaseResponse;

export default AyahQuestionsResponse;
