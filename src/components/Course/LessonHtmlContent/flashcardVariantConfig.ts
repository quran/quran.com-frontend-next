import { FlashCardVariant } from '@/components/Course/FlashCards/types';

type FlashcardVariantConfig = {
  subtitleKey: string;
};

const FLASHCARD_VARIANT_CONFIG: Record<FlashCardVariant, FlashcardVariantConfig> = {
  [FlashCardVariant.List]: {
    subtitleKey: 'flashcards.list-subtitle',
  },
  [FlashCardVariant.Carousel]: {
    subtitleKey: 'flashcards.carousel-subtitle',
  },
  [FlashCardVariant.Deck]: {
    subtitleKey: 'flashcards.deck-subtitle',
  },
};

export default FLASHCARD_VARIANT_CONFIG;
