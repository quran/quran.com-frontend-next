import ShortDescription from './ShortDescription';
import TranslatedName from './TranslatedName';

interface AvailableTranslation {
  id?: number;
  name?: string;
  authorName?: string;
  slug?: string;
  languageName?: string;
  translatedName?: TranslatedName;
  shortDescription?: ShortDescription;
}
export default AvailableTranslation;
