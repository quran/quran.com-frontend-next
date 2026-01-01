import { WordVerse } from '@/types/Word';

export enum FormErrorId {
  RequiredField = 'required-field',
  MinimumLength = 'minimum-length',
  MaximumLength = 'maximum-length',
}

export interface FormError {
  id: FormErrorId;
  message: string;
}

export interface TranslationFeedbackFormErrors {
  translation?: FormError;
  feedback?: FormError;
}

export interface UseTranslationFeedbackFormProps {
  verse: WordVerse;
  onClose: () => void;
}
