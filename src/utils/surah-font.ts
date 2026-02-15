import { getSurahFontFamily, getSurahFontVersion } from './surah';

const FIRST_SURAH_FONT_URL = '/fonts/quran/surah-names/v1.ttf';
const SECOND_SURAH_FONT_URL = '/fonts/quran/surah-names/v2.ttf';

const loadedFonts = new Set<string>();

export const loadSurahFont = async (chapterId: number): Promise<void> => {
  const fontVersion = getSurahFontVersion(chapterId);
  const fontUrl = chapterId <= 59 ? FIRST_SURAH_FONT_URL : SECOND_SURAH_FONT_URL;
  const fontFamily = getSurahFontFamily(chapterId);
  const cacheKey = `${fontFamily}-${fontVersion}`;
  if (loadedFonts.has(cacheKey)) return;

  const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  loadedFonts.add(cacheKey);
};

export const getSurahFontUrl = (chapterId: number): string => {
  const fontVersion = getSurahFontVersion(chapterId);
  return fontVersion === 'v1' ? FIRST_SURAH_FONT_URL : SECOND_SURAH_FONT_URL;
};
