import ramadanDonationPopupAyahs from '@/data/ramadan_donation_popup_ayahs.json';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type RamadanDonationPopupAyahEntry = {
  date: string;
  verseKey: string;
};

export type RamadanDonationPopupAyah = {
  chapter: number;
  verse: number;
  verseKey: string;
};

const formatLocalDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const parseLocalDateToTimestamp = (date: string): number => {
  const [day, month, year] = date.split('/').map(Number);

  return new Date(year, month - 1, day).getTime();
};

const ayahEntries = (ramadanDonationPopupAyahs as RamadanDonationPopupAyahEntry[]).map((entry) => ({
  ...entry,
  timestamp: parseLocalDateToTimestamp(entry.date),
}));

const ayahEntryMap = new Map(ayahEntries.map((entry) => [entry.date, entry]));

const toAyah = (entry: RamadanDonationPopupAyahEntry): RamadanDonationPopupAyah => {
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(entry.verseKey).map(Number);

  return {
    chapter,
    verse,
    verseKey: entry.verseKey,
  };
};

export const getCurrentRamadanDonationPopupAyah = (
  now: Date = new Date(),
): RamadanDonationPopupAyah | null => {
  if (!ayahEntries.length) {
    return null;
  }

  const currentDate = formatLocalDate(now);
  const exactMatch = ayahEntryMap.get(currentDate);

  if (exactMatch) {
    return toAyah(exactMatch);
  }

  const currentDateTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const nextAvailableEntry =
    ayahEntries.find((entry) => entry.timestamp >= currentDateTimestamp) ??
    ayahEntries[ayahEntries.length - 1];

  return nextAvailableEntry ? toAyah(nextAvailableEntry) : null;
};

export default getCurrentRamadanDonationPopupAyah;
