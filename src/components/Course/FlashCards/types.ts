export type FlashCardData = {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
};

export enum FlashCardVariant {
  Carousel = 'carousel',
  List = 'list',
}
