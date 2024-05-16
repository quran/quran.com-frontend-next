import Verse from '../Verse';
import Word from '../Word';

type SearchVerseItem = Verse & {
  words: Word[];
} & {
  kalimatData: {
    matches?: string;
  };
};
export default SearchVerseItem;
