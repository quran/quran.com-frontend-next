import { createContext } from 'react';

export type StartingVerseHighlightContextValue = {
  verseKey?: string;
};

const StartingVerseHighlightContext = createContext<StartingVerseHighlightContextValue>({
  verseKey: undefined,
});

export default StartingVerseHighlightContext;
