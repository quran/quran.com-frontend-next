import AvailableTranslation from './AvailableTranslation';
import TranslatedName from './TranslatedName';

interface AvailableWordByWordTranslation extends AvailableTranslation {
  id: number;
  name: string;
  authorName: string;
  slug: string;
  languageName: string;
  isoCode: string;
  translatedName: TranslatedName;
}
export default AvailableWordByWordTranslation;
