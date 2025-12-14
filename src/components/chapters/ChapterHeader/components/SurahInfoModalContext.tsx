import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

export interface SurahInfoModalContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SurahInfoModalContext = createContext<SurahInfoModalContextType | undefined>(
  undefined,
);

export interface SurahInfoModalProviderProps {
  children: ReactNode;
}

/**
 * Custom hook to access surah info modal context
 * @returns {SurahInfoModalContextType} Surah info modal context with state and setter function
 * @throws Error if used outside of SurahInfoModalProvider
 */
export function useSurahInfoModalContext(): SurahInfoModalContextType {
  const context = useContext(SurahInfoModalContext);
  if (context) return context;
  throw new Error('useSurahInfoModalContext must be used within a SurahInfoModalProvider');
}

/**
 * Surah Info Modal Provider Component
 *
 * Provides surah info modal context to the Quran reader component.
 * This provider is placed within the QuranReader component to ensure the modal state
 * persists when switching between TranslationView and ReadingView.
 *
 * Why this provider is needed:
 * - SurahInfoButton gets remounted when switching between TranslationView and ReadingView
 * - Local state in SurahInfoButton resets on remount, causing the modal to reopen multiple times
 * - We need the modal to open automatically when initially navigating to /surah/[chapterId]/info
 * - This provider doesn't remount when views change, preserving the modal state
 *
 * @param {SurahInfoModalProviderProps} props - Props for the SurahInfoModalProvider component
 * @returns {JSX.Element} SurahInfoModalProvider component
 */
export const SurahInfoModalProvider = ({ children }: SurahInfoModalProviderProps): JSX.Element => {
  const router = useRouter();
  const { chapterId } = router.query;

  // Initialize modal state based on route - open if on surah info page
  const isSurahInfoPage = router.pathname.includes('/surah/[chapterId]/info');
  const [isOpen, setIsOpen] = useState<boolean>(isSurahInfoPage);

  useEffect(() => {
    if (chapterId && isSurahInfoPage) {
      setIsOpen(true);
    }
  }, [chapterId, isSurahInfoPage]);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);

  return (
    <SurahInfoModalContext.Provider value={contextValue}>{children}</SurahInfoModalContext.Provider>
  );
};
