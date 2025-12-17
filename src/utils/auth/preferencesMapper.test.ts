import { describe, it, expect } from 'vitest';

import { stateToPreferenceGroups } from './preferencesMapper';

import PreferenceGroup from '@/types/auth/PreferenceGroup';

describe('preferencesMapper (guest + language fallback)', () => {
  it('maps guest bookmark and language/customization', () => {
    const state = {
      defaultSettings: { detectedLanguage: 'en', userHasCustomised: true },
      guestBookmark: { readingBookmark: 'ayah:1:1' },
    } as any;
    const groups = stateToPreferenceGroups(state);
    expect(groups[PreferenceGroup.READING_BOOKMARK].bookmark).toBe('ayah:1:1');
    expect(groups[PreferenceGroup.LANGUAGE].language).toBe('en');
    expect(groups[PreferenceGroup.USER_CUSTOMIZATION].userHasCustomised).toBe(true);
  });
});
