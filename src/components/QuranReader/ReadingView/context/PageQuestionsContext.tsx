import { createContext, useContext } from 'react';

import { QuestionsCount } from '@/utils/auth/api';

export const PageQuestionsContext = createContext<Record<string, QuestionsCount> | undefined>(
  undefined,
);

export const usePageQuestions = () => {
  const context = useContext(PageQuestionsContext);
  return context ?? {};
};
