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

export const useBottomActionsExpand = () => useContext(BottomActionsExpandContext);
