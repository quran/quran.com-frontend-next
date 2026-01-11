import type Verse from '@/types/Verse';
import { WordVerse } from '@/types/Word';

export interface TranslationFeedbackFormErrors {
  translation?: string;
  feedback?: string;
}

export interface UseTranslationFeedbackFormProps {
  verse: WordVerse | Verse;
  onClose: () => void;
}
