/* eslint-disable max-lines */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

/**
 * Syncs Ayah of the Day and Quranic Calendar from CSV to JSON files.
 * Parses the Ayah of the Day Google Sheet exported as CSV and updates:
 * - ayah_of_the_day.json (sorted verse references by date)
 * - quranic-calendar.json (week start dates)
 */

const fs = require('fs');
const path = require('path');

// Path to the CSV file exported from Google Sheets
const CSV_PATH = path.join(process.cwd(), 'data', 'Ayah of the day - Table - Sheet.csv');
const AYAH_JSON_PATH = path.join(process.cwd(), 'data', 'ayah_of_the_day.json');
const CALENDAR_JSON_PATH = path.join(process.cwd(), 'data', 'quranic-calendar.json');

class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserError';
  }
}

const readFileUtf8OrThrow = (filePath, label) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    throw new UserError(
      `${label} not found or unreadable: ${filePath}\n` +
        `Original error: ${e?.message || String(e)}`,
    );
  }
};

const writeFileUtf8OrThrow = (filePath, content, label) => {
  try {
    fs.writeFileSync(filePath, content);
  } catch (e) {
    throw new UserError(
      `Failed to write ${label}: ${filePath}\nOriginal error: ${e?.message || String(e)}`,
    );
  }
};

const readJsonOrThrow = (filePath, label) => {
  const raw = readFileUtf8OrThrow(filePath, label);
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new UserError(
      `${label} contains invalid JSON: ${filePath}\n` +
        `Original error: ${e?.message || String(e)}`,
    );
  }
};

/**
 * Process a single character in CSV parsing
 */
const processCharacter = (state, c, next) => {
  const { field, row, rows, inQuotes } = state;

  if (c === '"') {
    if (inQuotes && next === '"') {
      state.field += '"';
      state.skipNext = true;
    } else {
      state.inQuotes = !inQuotes;
    }
    return;
  }

  if (!inQuotes && c === ',') {
    row.push(field);
    state.field = '';
    return;
  }

  if (!inQuotes && (c === '\n' || c === '\r')) {
    if (c === '\r' && next === '\n') state.skipNext = true;
    row.push(field);
    state.field = '';

    const hasAnyValue = row.some((v) => String(v).trim().length > 0);
    if (hasAnyValue) rows.push([...row]);

    state.row = [];
    return;
  }

  state.field += c;
};

/**
 * CSV parser that supports:
 * - quoted fields with commas
 * - escaped quotes ("")
 * - newlines inside quoted fields
 *
 * @param {string} raw
 * @returns {string[][]}
 */
const parseCsvText = (raw) => {
  const text = raw.replace(/^\uFEFF/, '');
  const state = {
    rows: [],
    row: [],
    field: '',
    inQuotes: false,
    skipNext: false,
  };

  for (let i = 0; i < text.length; i += 1) {
    if (state.skipNext) {
      state.skipNext = false;
      // eslint-disable-next-line no-continue
      continue;
    }

    processCharacter(state, text[i], text[i + 1]);
  }

  // flush last field/row
  state.row.push(state.field);
  const hasAnyValue = state.row.some((v) => String(v).trim().length > 0);
  if (hasAnyValue) state.rows.push(state.row);

  return state.rows;
};

const parseDateDMYToUtcTimestamp = (dateStr, contextLabel) => {
  const s = String(dateStr || '').trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (!m) {
    throw new UserError(`${contextLabel}: invalid date format "${s}". Expected DD/MM/YYYY.`);
  }

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    throw new UserError(`${contextLabel}: invalid date numbers "${s}".`);
  }
  if (year < 1900 || year > 2100) {
    throw new UserError(`${contextLabel}: year out of range in "${s}".`);
  }
  if (month < 1 || month > 12) {
    throw new UserError(`${contextLabel}: month out of range in "${s}".`);
  }
  if (day < 1 || day > 31) {
    throw new UserError(`${contextLabel}: day out of range in "${s}".`);
  }

  // Validate real calendar date (e.g. 31/04 is invalid)
  const ts = Date.UTC(year, month - 1, day);
  const d = new Date(ts);
  const ok = d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;

  if (!ok) {
    throw new UserError(`${contextLabel}: non-existent calendar date "${s}".`);
  }

  return ts;
};

const toDateParts = (timestamp) => {
  const d = new Date(timestamp);
  return {
    year: String(d.getUTCFullYear()),
    month: String(d.getUTCMonth() + 1),
    day: String(d.getUTCDate()),
  };
};

const isHeaderRow = (row) => {
  const date = String(row?.[2] || '').trim();
  const week = String(row?.[3] || '').trim();
  const ref = String(row?.[6] || '').trim();
  return date === 'Date' || week === 'Week' || ref === 'Reference';
};

const extractAyahEntries = (rows) => {
  const entries = [];
  rows.forEach((row, idx) => {
    if (!row || row.length < 7) return;
    if (isHeaderRow(row)) return;

    const date = String(row[2] || '').trim();
    const reference = String(row[6] || '').trim();
    if (!date) return;

    if (reference && reference !== 'Reference') {
      // validate date early so we never write corrupt output
      parseDateDMYToUtcTimestamp(date, `CSV row ${idx + 1}`);
      entries.push({ date, verseKey: reference });
    }
  });
  return entries;
};

const computeWeekEarliestDates = (rows) => {
  const weekEarliestTimestamp = new Map();
  rows.forEach((row, idx) => {
    if (!row || row.length < 4) return;
    if (isHeaderRow(row)) return;

    const date = String(row[2] || '').trim();
    const weekStr = String(row[3] || '').trim();
    if (!date || !weekStr || weekStr === 'Week') return;

    const weekNum = Number(weekStr);
    if (Number.isNaN(weekNum)) {
      throw new UserError(`CSV row ${idx + 1}: invalid week number "${weekStr}".`);
    }

    const ts = parseDateDMYToUtcTimestamp(date, `CSV row ${idx + 1}`);
    const current = weekEarliestTimestamp.get(weekNum);
    if (current === undefined || ts < current) weekEarliestTimestamp.set(weekNum, ts);
  });
  return weekEarliestTimestamp;
};

const parseCsv = () => {
  const raw = readFileUtf8OrThrow(CSV_PATH, 'CSV file');
  const rows = parseCsvText(raw);

  // If the first row is a header, keep it; our helpers skip it anyway.
  const ayahEntries = extractAyahEntries(rows);
  const weekEarliestTimestamp = computeWeekEarliestDates(rows);

  return { ayahEntries, weekEarliestTimestamp };
};

const updateAyahJson = (entries) => {
  const sorted = [...entries].sort(
    (a, b) =>
      parseDateDMYToUtcTimestamp(a.date, `ayah entry "${a.date}"`) -
      parseDateDMYToUtcTimestamp(b.date, `ayah entry "${b.date}"`),
  );

  writeFileUtf8OrThrow(
    AYAH_JSON_PATH,
    `${JSON.stringify(sorted, null, 2)}\n`,
    'ayah_of_the_day.json',
  );

  console.log(`Updated ${AYAH_JSON_PATH} with ${sorted.length} entries (sorted by date).`);
};

const updateCalendarJson = (weekEarliestTimestamp) => {
  const calendar = readJsonOrThrow(CALENDAR_JSON_PATH, 'quranic-calendar.json');

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

  writeFileUtf8OrThrow(
    CALENDAR_JSON_PATH,
    `${JSON.stringify(calendar, null, 2)}\n`,
    'quranic-calendar.json',
  );

  console.log(`Updated ${CALENDAR_JSON_PATH} week start dates from CSV (earliest date per week).`);
};

const main = () => {
  try {
    const { ayahEntries, weekEarliestTimestamp } = parseCsv();
    updateAyahJson(ayahEntries);
    updateCalendarJson(weekEarliestTimestamp);
  } catch (e) {
    const msg = e instanceof UserError ? e.message : e?.stack || e?.message || String(e);
    console.error(`ERROR: ${msg}`);
    process.exitCode = 1;
  }
};

main();
