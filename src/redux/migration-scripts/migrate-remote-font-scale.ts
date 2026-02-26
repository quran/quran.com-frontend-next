/* eslint-disable no-param-reassign */
import { logErrorToSentry } from '@/lib/sentry';
import {
  needsDefaultScaleMigration,
  migrateDefaultScale,
} from '@/redux/migration-scripts/migrate-default-scale';
import { needsFontScaleRemap, remapFontScale } from '@/redux/migration-scripts/remap-font-scale';
import { getMushafId } from '@/utils/api';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import { Mushaf, MushafLines, QuranFont } from 'types/QuranReader';

const STYLES = PreferenceGroup.QURAN_READER_STYLES;

const persistScaleRemap = (correctedScale: number, mushaf: Mushaf) => {
  addOrUpdateUserPreference('quranTextFontScale', correctedScale, STYLES, mushaf)
    .then(() => addOrUpdateUserPreference('fontScaleRemapVersion', 1, STYLES, mushaf))
    .catch((err) => logErrorToSentry(err, { transactionName: 'fontScaleRemap' }));
};

const persistDefaultScaleMigration = (
  newScale: number,
  mushaf: Mushaf,
  hasRemapVersion: boolean,
) => {
  addOrUpdateUserPreference('quranTextFontScale', newScale, STYLES, mushaf)
    .then(() =>
      // Write fontScaleRemapVersion first to prevent the old remap from cascading 4→7
      // if defaultScaleMigrated were to succeed alone in a partial-failure scenario.
      !hasRemapVersion
        ? addOrUpdateUserPreference('fontScaleRemapVersion', 1, STYLES, mushaf)
        : Promise.resolve(),
    )
    .then(() => addOrUpdateUserPreference('defaultScaleMigrated', 1, STYLES, mushaf))
    .catch((err) => logErrorToSentry(err, { transactionName: 'defaultScaleMigration' }));
};

/**
 * Remap stale font scale + migrate default scale (3→4) in remote preferences
 * BEFORE syncing to Redux. Mutates remoteStyles.quranTextFontScale in place.
 */
const remapRemoteFontScale = (
  remoteStyles: Record<string, any>,
  localQuranFont: QuranFont,
  localMushafLines: MushafLines,
) => {
  if (remoteStyles?.quranTextFontScale == null) return;

  const effectiveFont = remoteStyles.quranFont ?? localQuranFont;
  const mushafLines = remoteStyles.mushafLines ?? localMushafLines;

  if (!remoteStyles.fontScaleRemapVersion) {
    if (needsFontScaleRemap(effectiveFont, remoteStyles.quranTextFontScale)) {
      const correctedScale = remapFontScale(effectiveFont, remoteStyles.quranTextFontScale);
      remoteStyles.quranTextFontScale = correctedScale;
      const { mushaf } = getMushafId(effectiveFont, mushafLines);
      persistScaleRemap(correctedScale, mushaf);
    }
  }

  if (!remoteStyles.defaultScaleMigrated) {
    if (needsDefaultScaleMigration(effectiveFont, remoteStyles.quranTextFontScale)) {
      const newScale = migrateDefaultScale(effectiveFont, remoteStyles.quranTextFontScale);
      remoteStyles.quranTextFontScale = newScale;
      const { mushaf } = getMushafId(effectiveFont, mushafLines);
      persistDefaultScaleMigration(newScale, mushaf, !!remoteStyles.fontScaleRemapVersion);
    }
  }
};

export default remapRemoteFontScale;
