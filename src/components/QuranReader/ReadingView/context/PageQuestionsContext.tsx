import { createContext, useContext } from 'react';

export const PageQuestionsContext = createContext<Record<string, number> | undefined>(undefined);

export const usePageQuestions = () => {
  const context = useContext(PageQuestionsContext);
  if (!context) {
    throw new Error('usePageQuestions must be used within a VersesProvider');
  }
  return context;
};
