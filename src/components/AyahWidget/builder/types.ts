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
  showTafsirs: boolean;
  showReflections: boolean;
  showAnswers: boolean;
  reciter: number | null;
  showArabic: boolean;
  rangeEnabled: boolean;
  rangeEnd: number;
  customSize: {
    width: string;
    height: string;
  };
};
