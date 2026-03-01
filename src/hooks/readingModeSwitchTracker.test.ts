import { beforeEach, describe, expect, it } from 'vitest';

import {
  didUserSwitchReadingMode,
  markUserSwitchedReadingMode,
  resetUserSwitchFlag,
} from './readingModeSwitchTracker';

describe('readingModeSwitchTracker', () => {
  beforeEach(() => {
    resetUserSwitchFlag();
  });

  it('suppresses only on the same pathname regardless of query changes', () => {
    markUserSwitchedReadingMode('/1/2?readingMode=reading');

    expect(didUserSwitchReadingMode('/1/2?readingMode=translation')).toBe(true);
    expect(didUserSwitchReadingMode('/1/3?readingMode=reading')).toBe(false);
  });

  it('clears suppression when reset is called', () => {
    markUserSwitchedReadingMode('/2/255');
    expect(didUserSwitchReadingMode('/2/255?readingMode=translation')).toBe(true);

    resetUserSwitchFlag();
    expect(didUserSwitchReadingMode('/2/255?readingMode=translation')).toBe(false);
    expect(didUserSwitchReadingMode()).toBe(false);
  });
});
