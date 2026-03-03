interface RelatedVerse {
  id: number;
  verseIdFrom: number;
  verseIdTo: number;
  verseKeyFrom: string;
  verseKeyTo: string;
  relation: string;
  chapterNameFrom: string;
  chapterNameTo: string;
}

export default RelatedVerse;
