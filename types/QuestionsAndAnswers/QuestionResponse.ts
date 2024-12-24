import { Question } from './Question';

import { BaseResponse } from 'types/ApiResponses';

type QuestionResponse = Question & BaseResponse;

export default QuestionResponse;
