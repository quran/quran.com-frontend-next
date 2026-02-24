import { describe, expect, it } from 'vitest';

import { makeUiSectionUrl } from './apiPaths';

describe('makeUiSectionUrl', () => {
  it('adds key path and language query parameter', () => {
    const url = makeUiSectionUrl('navbar_announcement', 'fr');

    expect(url).toContain('/ui_sections/navbar_announcement');
    expect(url).toContain('language=fr');
  });
});
