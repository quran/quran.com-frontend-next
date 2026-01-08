import { WidgetInputError } from '@/components/AyahWidget/getAyahWidgetData';

export type VerseRangeParam = {
  ayah: string;
  rangeEnd?: number;
};

/**
 * Parse a query param as a single string.
 * @param {string | string[] | undefined} value - The query param value.
 * @returns {string | undefined} The parsed string value.
 */
export const parseString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Parse a query param as a boolean ("true" -> true, everything else -> false).
 * @param {string | string[] | undefined} value - The query param value.
 * @param {boolean} defaultValue - The default value to return if the query param is undefined.
 * @returns {boolean} The parsed boolean value.
 */
export const parseBool = (
  value: string | string[] | undefined,
  defaultValue: boolean = false,
): boolean => {
  if (Array.isArray(value)) return parseBool(value[0], defaultValue);
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Parse a query param as a number, returning undefined when invalid.
 * @param {string | undefined} value - The query param value.
 * @returns {number | undefined} The parsed number value.
 */
export const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

/**
 * Parse verses range param.
 * Formats: "chapter:verse" or "chapter:from-to"
 * @param {string} value - The query param value.
 * @returns {VerseRangeParam} The parsed verses range param.
 */
export const parseVersesParam = (value: string): VerseRangeParam => {
  const match = value.match(/^(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    throw new WidgetInputError(
      400,
      'Invalid verses format. Expected "chapter:verse" or "chapter:from-to".',
    );
  }

  const chapter = match[1];
  const from = match[2];
  const toRaw = match[3];

  const ayah = `${chapter}:${from}`;
  const rangeEnd = toRaw ? Number(toRaw) : undefined;

  if (rangeEnd !== undefined && (!Number.isFinite(rangeEnd) || rangeEnd <= Number(from))) {
    throw new WidgetInputError(400, 'Invalid range end. It must be greater than start.');
  }

  return { ayah, rangeEnd };
};
