import { describe, expect, it, vi } from 'vitest';

import Room, { RoomType } from '../../../types/QuranReflect/Room';

const loadNavigationModule = async (host: string) => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_QURAN_REFLECT_URL = host;
  const { getReflectionGroupLink } = await import('./navigation');
  return getReflectionGroupLink;
};

const clearEnv = () => {
  delete process.env.NEXT_PUBLIC_QURAN_REFLECT_URL;
};

describe('getReflectionGroupLink page URLs', () => {
  it.each([
    {
      scenario: 'remote host',
      env: 'https://test-new.quranreflect.org',
      room: { id: 1, roomType: RoomType.PAGE, subdomain: 'reflection-page' } as Room,
      expected: 'https://reflection-page.test-new.quranreflect.org',
    },
    {
      scenario: 'localhost with port',
      env: 'http://localhost:3028',
      room: { id: 2, roomType: RoomType.PAGE, subdomain: 'reflection' } as Room,
      expected: 'http://reflection.localhost:3028',
    },
    {
      scenario: 'missing subdomain',
      env: 'https://test-new.quranreflect.org/',
      room: { id: 3, roomType: RoomType.PAGE } as Room,
      expected: 'https://test-new.quranreflect.org',
    },
  ])('builds the page URL for a $scenario', async ({ env, room, expected }) => {
    const getReflectionGroupLink = await loadNavigationModule(env);
    try {
      expect(getReflectionGroupLink(room)).toBe(expected);
    } finally {
      clearEnv();
    }
  });
});

describe('getReflectionGroupLink group URLs', () => {
  it('returns the group URL for group rooms', async () => {
    const getReflectionGroupLink = await loadNavigationModule('https://test-new.quranreflect.org');
    try {
      const room: Room = { id: 4, roomType: RoomType.GROUP, url: 'reflections' };
      expect(getReflectionGroupLink(room)).toBe(
        'https://test-new.quranreflect.org/groups/reflections',
      );
    } finally {
      clearEnv();
    }
  });
});
