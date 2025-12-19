import ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/ayah-widget';
import type AvailableTranslation from 'types/AvailableTranslation';

/**
 * User preferences for the Ayah Widget Builder.
 */
export type Preferences = {
  containerId: string;
  selectedSurah: number;
  selectedAyah: number;
  translations: AvailableTranslation[];
  theme: ThemeTypeVariant;
  mushaf: MushafType;
  enableAudio: boolean;
  enableWbwTranslation: boolean;
  showTranslatorName: boolean;
  showQuranLink: boolean;
  reciter: number | null;
  showArabic: boolean;
  customSize: {
    width: string;
    height: string;
  };
};
