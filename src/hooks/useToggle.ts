import { useState } from 'react';

import { logEvent } from '@/utils/eventLogger';

interface UseToggleParams {
  initialState?: boolean;
  eventName?: string;
}

/**
 * Custom hook for managing toggle state with event logging
 * @returns {[boolean, () => void]} A tuple containing the current state and the toggle function
 */
const useToggle = ({ initialState = false, eventName }: UseToggleParams) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const toggle = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (eventName) logEvent(`${eventName}_${newState ? 'open' : 'close'}`);
      return newState;
    });
  };

  return [isOpen, toggle] as const;
};

export default useToggle;
