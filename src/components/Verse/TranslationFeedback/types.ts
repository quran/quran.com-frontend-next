import { WordVerse } from '@/types/Word';

export interface TranslationFeedbackFormErrors {
  translation?: string;
  feedback?: string;
}

export interface UseTranslationFeedbackFormProps {
  verse: WordVerse;
  onClose: () => void;
}
