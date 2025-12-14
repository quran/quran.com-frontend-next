/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/**
 * Sync data/ayah_of_the_day.json and data/quranic-calendar.json from
 * the exported CSV of the google sheet "Ayah of the day - Table".
 *
 * The CSV is treated as the source of truth for:
 *  - Date -> verseKey (Reference column)
 *  - Week -> earliest Gregorian date (used to update calendar week start dates)
 *
 * Notes:
 *  - CSV columns: [ignored, Nr, Date, Week, Day, Ayah, Reference, Surah, Ayah]
 *  - We assume comma-separated rows without quoted fields.
 *  - Weeks are updated by setting year/month/day to the earliest date for that week.
 *
 * What this script does:
 *  1. Reads and parses the CSV file.
 *  2. Extracts date, week number, and verse reference (verseKey) from each row.
 *  3. Creates an array of {date, verseKey} entries and a map of week numbers to their earliest dates.
 *  4. Sorts ayah entries by date and writes them to data/ayah_of_the_day.json.
 *  5. Updates data/quranic-calendar.json week start dates to the earliest Gregorian date per week.
 */
const fs = require('fs');
const path = require('path');

// Change these paths if necessary. You need to have the CSV file downloaded locally.
const CSV_PATH = path.join(process.cwd(), 'data', 'Ayah of the day - Table - Sheet.csv');
const AYAH_JSON_PATH = path.join(process.cwd(), 'data', 'ayah_of_the_day.json');
const CALENDAR_JSON_PATH = path.join(process.cwd(), 'data', 'quranic-calendar.json');

const toTimestamp = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
};

const toDateParts = (timestamp) => {
  const d = new Date(timestamp);
  return {
    year: String(d.getUTCFullYear()),
    month: String(d.getUTCMonth() + 1),
    day: String(d.getUTCDate()),
  };
};

const parseCsv = () => {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const ayahEntries = [];
  const weekEarliestTimestamp = new Map(); // weekNumber -> earliest UTC timestamp

  lines.forEach((line) => {
    const cols = line.split(',');
    if (cols.length < 7) return;
    const date = (cols[2] || '').trim();
    const weekStr = (cols[3] || '').trim();
    const reference = (cols[6] || '').trim();

    if (!date || date === 'Date') return;
    // Verse mapping
    if (reference && reference !== 'Reference') {
      ayahEntries.push({ date, verseKey: reference });
    }

    // Week start mapping
    const weekNum = Number(weekStr);
    if (!Number.isNaN(weekNum) && weekStr !== '' && weekStr !== 'Week') {
      const ts = toTimestamp(date);
      const current = weekEarliestTimestamp.get(weekNum);
      if (current === undefined || ts < current) {
        weekEarliestTimestamp.set(weekNum, ts);
      }
    }
  });

  return { ayahEntries, weekEarliestTimestamp };
};

const updateAyahJson = (entries) => {
  const sorted = [...entries].sort((a, b) => toTimestamp(a.date) - toTimestamp(b.date));
  fs.writeFileSync(AYAH_JSON_PATH, JSON.stringify(sorted, null, 2));
  console.log(`Updated ${AYAH_JSON_PATH} with ${sorted.length} entries (sorted by date).`);
};

const updateCalendarJson = (weekEarliestTimestamp) => {
  const calendar = JSON.parse(fs.readFileSync(CALENDAR_JSON_PATH, 'utf8'));
  Object.values(calendar).forEach((weeksArray) => {
    weeksArray.forEach((week) => {
      const ts = weekEarliestTimestamp.get(Number(week.weekNumber));
      if (ts !== undefined) {
        const parts = toDateParts(ts);
        week.year = parts.year;
        week.month = parts.month;
        week.day = parts.day;
      }
    });
  });
  fs.writeFileSync(CALENDAR_JSON_PATH, JSON.stringify(calendar, null, 2));
  console.log(`Updated ${CALENDAR_JSON_PATH} week start dates from CSV (earliest date per week).`);
};

const main = () => {
  const { ayahEntries, weekEarliestTimestamp } = parseCsv();
  updateAyahJson(ayahEntries);
  updateCalendarJson(weekEarliestTimestamp);
};

main();
