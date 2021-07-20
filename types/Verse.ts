import Word from './Word';
import Translation from './Translation';
import AudioResponse from './AudioResponse';

interface Verse {
  id: number;
  verseNumber: number;
  chapterId?: number | string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  verseKey: string;
  verseIndex: number;
  words: Word[];
  textUthmani?: string;
  textUthmaniSimple?: string;
  textUthmaniTajweed?: string;
  textImlaei?: string;
  textImlaeiSimple?: string;
  textIndopak?: string;
  sajdahNumber: null;
  sajdahType: null;
  imageUrl?: string;
  imageWidth?: number;
  v1Page?: number;
  v2Page?: number;
  codeV1?: string;
  codeV2?: string;
  translations?: Translation[];
  audio?: AudioResponse;
}

export default Verse;
