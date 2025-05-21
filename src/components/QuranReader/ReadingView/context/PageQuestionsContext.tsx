import { createContext, useContext } from 'react';

export const PageQuestionsContext = createContext<Record<string, number> | undefined>(undefined);

export const usePageQuestions = () => {
  const context = useContext(PageQuestionsContext);
  return context ?? {};
};
