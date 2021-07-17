import TranslatedName from './TranslatedName';

interface TranslationResource {
  id?: number;
  name?: string;
  authorName?: string;
  slug?: string;
  languageName?: string;
  translatedName?: TranslatedName;
}
export default TranslationResource;
