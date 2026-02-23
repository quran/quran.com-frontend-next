import { QuranFont } from 'types/QuranReader';

/**
 * Font scale remap rules combining PR #3008 legacy remaps with
 * the SCSS font size refactor.
 *
 * Base (all Quran fonts): 6→7, 7→9, 8-10→10.
 * Group 1 (QPCHafs, MadaniV1, MadaniV2, TajweedV4): also 4→7 (legacy).
 * IndoPak: also 5→7 (legacy).
 */

const BASE_REMAP: Record<number, number> = { 6: 7, 7: 9, 8: 10, 9: 10 };

const GROUP1_REMAP: Record<number, number> = { 4: 7, ...BASE_REMAP };
const INDOPAK_REMAP: Record<number, number> = { 5: 7, ...BASE_REMAP };

const GROUP1_FONTS = new Set([
  QuranFont.QPCHafs,
  QuranFont.MadaniV1,
  QuranFont.MadaniV2,
  QuranFont.TajweedV4,
]);

export const remapFontScale = (quranFont: QuranFont, quranTextFontScale: number): number => {
  if (GROUP1_FONTS.has(quranFont)) {
    return GROUP1_REMAP[quranTextFontScale] ?? quranTextFontScale;
  }
  if (quranFont === QuranFont.IndoPak) {
    return INDOPAK_REMAP[quranTextFontScale] ?? quranTextFontScale;
  }
  return quranTextFontScale;
};

export const needsFontScaleRemap = (quranFont: QuranFont, quranTextFontScale: number): boolean =>
  remapFontScale(quranFont, quranTextFontScale) !== quranTextFontScale;
