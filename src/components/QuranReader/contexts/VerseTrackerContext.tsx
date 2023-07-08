import { createContext, useContext, useMemo, useRef } from 'react';

interface VerseTrackerContextType {
  // this will store a queue of verse keys that have been read by the user
  verseKeysQueue: React.MutableRefObject<Set<string>>;

  shouldTrackObservedVerses: React.MutableRefObject<boolean>;
}

const VerseTrackerContext = createContext<VerseTrackerContextType>(null);

export const VerseTrackerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const verseKeysQueue = useRef<Set<string>>(new Set());
  const shouldTrackObservedVerses = useRef(true);
  const value = useMemo(() => ({ verseKeysQueue, shouldTrackObservedVerses }), []);

  return <VerseTrackerContext.Provider value={value}>{children}</VerseTrackerContext.Provider>;
};

export const useVerseTrackerContext = () => useContext(VerseTrackerContext);
