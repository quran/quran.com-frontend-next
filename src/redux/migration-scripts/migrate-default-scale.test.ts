/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import { migrateDefaultScale, needsDefaultScaleMigration } from './migrate-default-scale';

import { QuranFont } from '@/types/QuranReader';

const AFFECTED_FONTS = [
  QuranFont.QPCHafs,
  QuranFont.MadaniV1,
  QuranFont.MadaniV2,
  QuranFont.TajweedV4,
  QuranFont.IndoPak,
];

const UNAFFECTED_FONTS = [QuranFont.Uthmani, QuranFont.Tajweed];

describe('migrate-default-scale', () => {
  describe('migrateDefaultScale', () => {
    it.each(AFFECTED_FONTS.map((font) => [font]))(
      'remaps scale 3 → 4 for affected font %s',
      (font) => {
        expect(migrateDefaultScale(font as QuranFont, 3)).toBe(4);
      },
    );

    it.each(
      AFFECTED_FONTS.flatMap((font) => [1, 2, 4, 5, 6, 7, 8, 9, 10].map((scale) => [font, scale])),
    )('returns scale unchanged for affected font %s at scale %d', (font, scale) => {
      expect(migrateDefaultScale(font as QuranFont, scale as number)).toBe(scale);
    });

    it.each(
      UNAFFECTED_FONTS.flatMap((font) =>
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scale) => [font, scale]),
      ),
    )('returns scale unchanged for unaffected font %s at scale %d', (font, scale) => {
      expect(migrateDefaultScale(font as QuranFont, scale as number)).toBe(scale);
    });
  });

  describe('needsDefaultScaleMigration', () => {
    it.each(AFFECTED_FONTS.map((font) => [font]))(
      'returns true for affected font %s at scale 3',
      (font) => {
        expect(needsDefaultScaleMigration(font as QuranFont, 3)).toBe(true);
      },
    );

    it.each(
      AFFECTED_FONTS.flatMap((font) => [1, 2, 4, 5, 6, 7, 8, 9, 10].map((scale) => [font, scale])),
    )('returns false for affected font %s at scale %d', (font, scale) => {
      expect(needsDefaultScaleMigration(font as QuranFont, scale as number)).toBe(false);
    });

    it.each(
      UNAFFECTED_FONTS.flatMap((font) =>
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scale) => [font, scale]),
      ),
    )('returns false for unaffected font %s at scale %d', (font, scale) => {
      expect(needsDefaultScaleMigration(font as QuranFont, scale as number)).toBe(false);
    });
  });
});
