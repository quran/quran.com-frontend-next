import SlugType from './SlugType';
import TranslatedNameType from './TranslatedNameType';

interface ChapterType {
  id: number | string;
  versesCount: number;
  bismillahPre: boolean;
  revelationOrder: number;
  revelationPlace: string;
  pages: Array<number>;
  nameComplex: string;
  nameSimple: string;
  nameArabic: string;
  chapterNumber: number;
  translatedName: TranslatedNameType;
  defaultSlug: SlugType;
  slugs?: Array<SlugType>;
}

export default ChapterType;
