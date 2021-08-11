import TranslatedName from './TranslatedName';

interface TafsirInfo {
  id?: number;
  name?: string;
  authorName?: string;
  slug?: string;
  languageName?: string;
  translatedName: TranslatedName;
}

export default TafsirInfo;
