import { FlashCardVariant } from '@/components/Course/FlashCards/types';

type FlashcardVariantConfig = {
  subtitleKey: string;
  subtitleDefault: string;
};

const FLASHCARD_VARIANT_CONFIG: Record<FlashCardVariant, FlashcardVariantConfig> = {
  [FlashCardVariant.List]: {
    subtitleKey: 'flashcards.list-subtitle',
    subtitleDefault: 'Tap to expand, mark words as mastered',
  },
  [FlashCardVariant.Carousel]: {
    subtitleKey: 'flashcards.carousel-subtitle',
    subtitleDefault: 'Swipe through cards, tap to flip',
  },
  [FlashCardVariant.Deck]: {
    subtitleKey: 'flashcards.deck-subtitle',
    subtitleDefault: 'Swipe right if you know it, left to review',
  },
};

export default FLASHCARD_VARIANT_CONFIG;
