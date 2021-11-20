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
  transliteratedName: string;
  nameArabic: string;
  translatedName: TranslatedName | string;
  defaultSlug: Slug;
  slugs?: Slug[];
}

export default Chapter;
