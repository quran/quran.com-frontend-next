export type JsonNumberString = `${number}`;

/**
 * Type guard to ensure a value is a finite numeric string that can round-trip through Number().
 * Helps prevent persisting invalid numeric strings (e.g. "123abc" or "1.2.3").
 *
 * @returns {value is JsonNumberString}
 */
export const isJsonNumberString = (value: unknown): value is JsonNumberString => {
  if (typeof value !== 'string') return false;
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) return false;
  const parsed = Number(trimmedValue);
  return Number.isFinite(parsed);
};

/**
 * Represents the user's audio repeat settings preferences.
 *
 * This interface is used to store repeat settings in Redux state and is subject to serialization/deserialization
 * quirks, especially with redux-persist. Notably, `-1` is used to represent Infinity for certain fields,
 * since redux-persist cannot serialize `Infinity` directly.
 *
 * Field values may be:
 * - `number`: for numeric values
 * - `JsonNumberString`: for values serialized as strings (e.g., when persisting to storage)
 * - `null`: to represent Infinity (see field-level docs)
 * - `undefined`: field is unset or not applicable
 */
export interface RepeatSettingsPreference {
  /**
   * The starting verse key of the repeat range (e.g., "2:255").
   * Optional; if undefined, no start is set.
   */
  from?: string;

  /**
   * The ending verse key of the repeat range (e.g., "2:257").
   * Optional; if undefined, no end is set.
   */
  to?: string;

  /**
   * Number of times to repeat the selected range.
   * - `number` or `JsonNumberString`: repeat N times.
   * - `-1`: repeat infinitely (Infinity). Used because redux-persist cannot serialize Infinity.
   * - `undefined`: no repeat range set.
   */
  repeatRange?: number | JsonNumberString | null;

  /**
   * Number of times to repeat each verse within the range.
   * - `number` or `JsonNumberString`: repeat each verse N times.
   * - `-1`: repeat each verse infinitely (Infinity). Used because redux-persist cannot serialize Infinity.
   * - `undefined`: no repeat per verse set.
   */
  repeatEachVerse?: number | JsonNumberString | null;

  /**
   * Multiplier for delay between repeated verses.
   * - `number` or `JsonNumberString`: delay multiplier value.
   * - `-1`: no delay (or infinite delay, depending on context).
   * - `undefined`: default delay.
   */
  delayMultiplier?: number | JsonNumberString | null;
}

export type AudioState = {
  enableAutoScrolling: boolean;
  isDownloadingAudio: boolean;
  showTooltipWhenPlayingAudio: boolean;
  // Optional: may be omitted from initial state objects unless a default is required.
  repeatSettings?: RepeatSettingsPreference;
};
