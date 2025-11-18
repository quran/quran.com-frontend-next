import { createContext, useContext } from 'react';

import { QuestionData } from '@/utils/auth/api';

export const PageQuestionsContext = createContext<Record<string, QuestionData> | undefined>(
  undefined,
);

export const usePageQuestions = () => {
  const context = useContext(PageQuestionsContext);
  return context ?? {};
};
