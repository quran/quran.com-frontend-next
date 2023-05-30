import { createContext, useContext, useRef } from 'react';

// this context will store a queue of verse keys that have been read by the user
const ReadingProgressContext = createContext<React.MutableRefObject<Set<string>>>(null);

export const ReadingProgressContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const verseKeysQueue = useRef<Set<string>>(new Set());

  return (
    <ReadingProgressContext.Provider value={verseKeysQueue}>
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgressContext = () => useContext(ReadingProgressContext);
