import type ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import type { MushafType } from '@/types/Embed';
import type AvailableTranslation from 'types/AvailableTranslation';

/**
 * User preferences for the Ayah Widget Builder.
 */
export type Preferences = {
  clientId: string;
  selectedSurah: number;
  selectedAyah: number;
  translations: AvailableTranslation[];
  theme: ThemeTypeVariant;
  mushaf: MushafType;
  enableAudio: boolean;
  enableWbwTranslation: boolean;
  enableWbwTransliteration: boolean;
  showTranslatorName: boolean;
  showTafsirs: boolean;
  showReflections: boolean;
  showLessons: boolean;
  showAnswers: boolean;
  locale: string;
  reciter: number | null;
  showArabic: boolean;
  rangeEnabled: boolean;
  rangeEnd: number;
  mergeVerses: boolean;
  customSize: {
    width: string;
    height: string;
  };
};

export type AyahWidgetOverrides = Partial<Omit<Preferences, 'translations' | 'customSize'>> & {
  translationIds?: number[];
  customSize?: {
    width?: string;
    height?: string;
  };
};

type SetStateAction<T> = T | ((prev: T) => T);

export type SetState<T> = (value: SetStateAction<T>) => void;

export type BasePreferenceContext = {
  theme: ThemeTypeVariant;
  locale: string;
  mushaf: MushafType;
  enableWbwTranslation: boolean;
  enableWbwTransliteration: boolean;
};

export type RangeMeta = {
  rangeOptions: number[];
  rangeSelectable: boolean;
  rangeStart: number;
  rangeEndCap: number;
};

export type WidgetSelectOption = {
  value: string | number;
  label?: string;
  labelKey?: string;
  disabled?: boolean;
};

export type WidgetSelectOptions = {
  items: WidgetSelectOption[];
  valueOverride?: string | number;
};

export type SimpleOverrideKey = Exclude<keyof Preferences, 'translations' | 'customSize'>;

export type WidgetIframeConfig = {
  src: string;
  widthValue: string;
  heightValue: string;
};
