import { describe, expect, it } from 'vitest';

import { getLocalSessionsNewerThanServer, getNewestServerSessionTime } from './readingSessionsSync';

const makeServerSession = (verseKey: string, updatedAt: string, id = 1) => {
  const [chapterNumber, verseNumber] = verseKey.split(':').map(Number);
  return { id, chapterNumber, verseNumber, updatedAt };
};

describe('getNewestServerSessionTime', () => {
  it('returns 0 when the account has no sessions', () => {
    expect(getNewestServerSessionTime([])).toBe(0);
    expect(getNewestServerSessionTime(undefined)).toBe(0);
  });

  it('returns the newest updatedAt and ignores invalid dates', () => {
    const sessions = [
      makeServerSession('3:13', '2026-11-20T10:00:00.000Z', 1),
      makeServerSession('3:23', '2026-11-20T11:00:00.000Z', 2),
      makeServerSession('2:1', 'not-a-date', 3),
    ];
    expect(getNewestServerSessionTime(sessions)).toBe(Date.parse('2026-11-20T11:00:00.000Z'));
  });
});

describe('getLocalSessionsNewerThanServer', () => {
  it('drops local sessions older than the newest session on the account', () => {
    const local = { '3:13': Date.parse('2026-11-20T10:00:00.000Z') };
    const server = [makeServerSession('3:23', '2026-11-20T11:00:00.000Z')];
    expect(getLocalSessionsNewerThanServer(local, server)).toEqual({});
  });

  it('keeps local sessions newer than the newest session on the account', () => {
    const newer = Date.parse('2026-11-20T12:00:00.000Z');
    const local = { '4:1': newer, '3:13': Date.parse('2026-11-20T10:00:00.000Z') };
    const server = [makeServerSession('3:23', '2026-11-20T11:00:00.000Z')];
    expect(getLocalSessionsNewerThanServer(local, server)).toEqual({ '4:1': newer });
  });

  it('keeps all local sessions when the account has none', () => {
    const local = { '1:1': 1, '2:255': 2 };
    expect(getLocalSessionsNewerThanServer(local, [])).toEqual(local);
  });
});
