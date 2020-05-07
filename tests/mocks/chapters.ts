export const chapter = {
  id: 1,
  chapterNumber: 1,
  bismillahPre: false,
  revelationOrder: 5,
  revelationPlace: 'makkah',
  nameComplex: 'Al-Fātiĥah',
  nameArabic: 'الفاتحة',
  nameSimple: 'Al-Fatihah',
  versesCount: 7,
  translatedName: {
    languageName: 'english',
    name: 'The Opener',
  },
  languageName: 'english',
  pages: [1, 2],
};

export const chapter2 = {
  id: 2,
  chapterNumber: 2,
  bismillahPre: true,
  revelationOrder: 87,
  revelationPlace: 'madinah',
  nameComplex: 'Al-Baqarah',
  nameArabic: 'البقرة',
  nameSimple: 'Al-Baqarah',
  versesCount: 286,
  pages: [2, 49],
  translatedName: { languageName: 'english', name: 'The Cow' },
};

export const chapter3 = {
  id: 3,
  chapterNumber: 3,
  bismillahPre: true,
  revelationOrder: 89,
  revelationPlace: 'madinah',
  nameComplex: 'Āli `Imrān',
  nameArabic: 'آل عمران',
  nameSimple: "Ali 'Imran",
  versesCount: 200,
  pages: [50, 76],
  translatedName: { languageName: 'english', name: 'Family of Imran' },
};

export const chapters = [chapter, chapter2, chapter3];
