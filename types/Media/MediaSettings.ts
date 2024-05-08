import { Alignment, Orientation } from '@/utils/media/constants';

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

export default MediaSettings;
