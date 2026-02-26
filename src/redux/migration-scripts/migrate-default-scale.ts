import { QuranFont } from 'types/QuranReader';

/**
 * Migrate default quranTextFontScale from 3 → 4 for the five Quran fonts
 * that were previously defaulting to scale 3.
 */

const AFFECTED_FONTS = new Set([
  QuranFont.QPCHafs,
  QuranFont.MadaniV1,
  QuranFont.MadaniV2,
  QuranFont.TajweedV4,
  QuranFont.IndoPak,
]);

export const migrateDefaultScale = (quranFont: QuranFont, scale: number): number => {
  if (AFFECTED_FONTS.has(quranFont) && scale === 3) return 4;
  return scale;
};

export const needsDefaultScaleMigration = (quranFont: QuranFont, scale: number): boolean =>
  migrateDefaultScale(quranFont, scale) !== scale;
