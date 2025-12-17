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

  it('prefers locale slice language over detected language', () => {
    const state = {
      defaultSettings: { detectedLanguage: 'en', userHasCustomised: false },
      locale: 'fr',
    } as any;
    const groups = stateToPreferenceGroups(state);
    expect(groups[PreferenceGroup.LANGUAGE].language).toBe('fr');
  });
});

describe('preferencesMapper (prunes default flags)', () => {
  it('removes default flags from slices', () => {
    const state = {
      readingPreferences: {
        selectedWordByWordLocale: 'en',
        isUsingDefaultWordByWordLocale: true,
      },
      quranReaderStyles: {
        quranFont: 'code_v1',
        isUsingDefaultFont: true,
      },
      translations: {
        selectedTranslations: [131],
        isUsingDefaultTranslations: true,
      },
      tafsirs: {
        selectedTafsirs: ['en-tafisr-ibn-kathir'],
        isUsingDefaultTafsirs: true,
      },
    } as any;
    const groups = stateToPreferenceGroups(state);
    expect(groups[PreferenceGroup.READING].isUsingDefaultWordByWordLocale).toBeUndefined();
    expect(groups[PreferenceGroup.QURAN_READER_STYLES].isUsingDefaultFont).toBeUndefined();
    expect(groups[PreferenceGroup.TRANSLATIONS].isUsingDefaultTranslations).toBeUndefined();
    expect(groups[PreferenceGroup.TAFSIRS].isUsingDefaultTafsirs).toBeUndefined();
  });
});

describe('preferencesMapper (audio mapping)', () => {
  it('maps audio partials and injects defaults', () => {
    const state = {
      audioPlayerState: {
        enableAutoScrolling: false,
        showTooltipWhenPlayingAudio: true,
      },
    } as any;
    const groups = stateToPreferenceGroups(state);
    expect(groups[PreferenceGroup.AUDIO].reciter).toBeDefined();
    expect(groups[PreferenceGroup.AUDIO].playbackRate).toBe(1);
    expect(groups[PreferenceGroup.AUDIO].enableAutoScrolling).toBe(false);
    expect(groups[PreferenceGroup.AUDIO].showTooltipWhenPlayingAudio).toBe(true);
  });
});
