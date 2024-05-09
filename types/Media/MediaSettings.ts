import Alignment from '@/types/Media/Alignment';
import Orientation from '@/types/Media/Orientation';

type MediaSettings = {
  verseTo: string;
  verseFrom: string;
  shouldHaveBorder: string;
  backgroundColorId: number;
  opacity: string;
  reciter: number;
  quranTextFontScale: number;
  translationFontScale: number;
  translations: number[];
  fontColor: string;
  verseAlignment: Alignment;
  translationAlignment: Alignment;
  orientation: Orientation;
  videoId: number;
  surah: number;
};

export type ChangedSettings = {
  [K in keyof MediaSettings]?: MediaSettings[K];
};

export default MediaSettings;
