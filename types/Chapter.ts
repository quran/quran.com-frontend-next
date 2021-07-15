import Slug from './Slug';
import TranslatedName from './TranslatedName';

interface Chapter {
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
  translatedName: TranslatedName;
  defaultSlug: Slug;
  slugs?: Slug[];
}

export default Chapter;
