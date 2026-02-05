/**
 * Sentinel value used to represent Infinity in persisted settings.
 * JSON serialization cannot represent Infinity, so we use -1 instead.
 * This must be converted to/from Infinity when reading/writing.
 */
export const REPEAT_INFINITY = -1;

/**
 * Persisted repeat audio modal settings.
 * Stored in Redux (localStorage) and synced to backend for logged-in users.
 *
 * Note: repeatRange, repeatEachVerse use -1 to represent Infinity.
 */
export interface RepeatSettings {
  from?: string; // Verse key, e.g. "1:2"
  to?: string; // Verse key, e.g. "1:5"
  repeatRange?: number; // Times to repeat range (-1 = Infinity)
  repeatEachVerse?: number; // Times to repeat each verse (-1 = Infinity)
  delayMultiplier?: number; // Delay multiplier between verses
}

type AudioState = {
  enableAutoScrolling: boolean;
  isDownloadingAudio: boolean;
  showTooltipWhenPlayingAudio: boolean;
  repeatSettings?: RepeatSettings;
};

export default AudioState;
