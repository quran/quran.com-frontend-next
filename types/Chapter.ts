import Slug from './Slug';

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
  translatedName: string;
  defaultSlug: Slug | string;
  slug?: string;
  slugs?: Slug[];
}

export default Chapter;
