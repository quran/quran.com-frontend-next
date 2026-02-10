import { createContext, useContext, useMemo, useState } from 'react';

interface BottomActionsExpandContextType {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const BottomActionsExpandContext = createContext<BottomActionsExpandContextType | null>(null);

export const BottomActionsExpandProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const value = useMemo(() => ({ isExpanded, setIsExpanded }), [isExpanded]);

  return (
    <BottomActionsExpandContext.Provider value={value}>
      {children}
    </BottomActionsExpandContext.Provider>
  );
};

/**
 * Consumers are expected to be wrapped in {@link BottomActionsExpandProvider}.
 *
 * Some parts of the app (e.g. Collection cards, bottom-sheet modals) reuse
 * `BottomActions` outside of TranslationView, so we provide a local fallback
 * state instead of crashing when the provider is missing.
 * @returns {BottomActionsExpandContextType} An object containing `isExpanded` and `setIsExpanded`.
 */
export const useBottomActionsExpand = (): BottomActionsExpandContextType => {
  const contextValue = useContext(BottomActionsExpandContext);
  const [isExpanded, setIsExpanded] = useState(false);

  return contextValue ?? { isExpanded, setIsExpanded };
};
