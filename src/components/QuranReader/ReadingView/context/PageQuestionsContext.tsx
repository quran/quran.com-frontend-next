import { createContext, useContext } from 'react';

import { QuestionsData } from '@/utils/auth/api';

export const PageQuestionsContext = createContext<Record<string, QuestionsData> | undefined>(
  undefined,
);

export const usePageQuestions = () => {
  const context = useContext(PageQuestionsContext);
  return context ?? {};
};
