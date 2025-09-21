import merge from 'lodash/merge';

export const mockTranslationKhattab = (overrides = {}) =>
  merge(
    {
      languageName: 'english',
      arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      text: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
      resourceName: 'Dr. Mustafa Khattab',
      authorName: 'Dr. Mustafa Khattab, The Clear Quran',
    },
    overrides,
  );

export const mockTranslationSaheeh = (overrides = {}) =>
  merge(
    {
      languageName: 'english',
      arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      text: 'In the name of Allāh,1 the Entirely Merciful, the Especially Merciful.',
      resourceName: 'Saheeh International',
    },
    overrides,
  );

export const mockTranslationHamidullah = (overrides = {}) =>
  merge(
    {
      languageName: 'french',
      arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      text: 'Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux. 1',
      resourceName: 'Muhammad Hamidullah',
    },
    overrides,
  );
