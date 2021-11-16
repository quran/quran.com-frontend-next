export const chapter = {
  id: 1,
  chapterNumber: 1,
  bismillahPre: false,
  revelationOrder: 5,
  revelationPlace: 'makkah',
  nameComplex: 'Al-Fātiĥah',
  nameArabic: 'الفاتحة',
  transliteratedName: 'Al-Fatihah',
  versesCount: 7,
  translatedName: 'The Opener',
  defaultSlug: { slug: 'al-fatihah', locale: 'english' },
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
  transliteratedName: 'Al-Baqarah',
  versesCount: 286,
  pages: [2, 49],
  defaultSlug: { slug: 'al-baqarah', locale: 'english' },
  translatedName: 'The Cow',
};

export const chapter3 = {
  id: 3,
  chapterNumber: 3,
  bismillahPre: true,
  revelationOrder: 89,
  revelationPlace: 'madinah',
  nameComplex: 'Āli `Imrān',
  nameArabic: 'آل عمران',
  transliteratedName: "Ali 'Imran",
  versesCount: 200,
  pages: [50, 76],
  defaultSlug: { slug: 'ali-imran', locale: 'english' },
  translatedName: 'Family of Imran',
};

export const chapters = [chapter, chapter2, chapter3];
