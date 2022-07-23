import Slug from './Slug';
import TranslatedName from './TranslatedName';

interface Chapter {
  id?: number | string;
  localizedId?: string;
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
  slug?: string;
  slugs?: Slug[];
}

export default Chapter;
