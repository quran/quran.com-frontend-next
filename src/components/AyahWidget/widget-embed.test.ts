/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import { DEFAULTS, INITIAL_PREFERENCES } from './widget-defaults';
import { buildEmbedSnippet } from './widget-embed';

describe('buildEmbedSnippet', () => {
  it('includes the resizer script and iframe data attribute', () => {
    const snippet = buildEmbedSnippet(INITIAL_PREFERENCES, '');

    expect(snippet).toContain('data-quran-embed="true"');
    expect(snippet).toContain('widget/embed-widget.js');
    expect(snippet).toContain('<script');
  });

  it('omits height constraints when height is empty', () => {
    const snippet = buildEmbedSnippet(INITIAL_PREFERENCES, '');

    expect(snippet).not.toContain('data-quran-embed-max-height');
    expect(snippet).not.toContain('\n  height="');
  });

  it('adds max height when a height value is provided', () => {
    const snippet = buildEmbedSnippet(
      {
        ...INITIAL_PREFERENCES,
        customSize: { ...INITIAL_PREFERENCES.customSize, height: '420px' },
      },
      '',
    );

    expect(snippet).toContain('data-quran-embed-max-height="420px"');
    expect(snippet).toContain('\n  height="420px"');
  });

  it('omits the default clientId from the embed snippet', () => {
    const preferences = {
      ...INITIAL_PREFERENCES,
      clientId: DEFAULTS.clientId,
    };

    const snippet = buildEmbedSnippet(preferences, String(DEFAULTS.translationId));

    expect(snippet).not.toContain('clientId=');
  });

  it('includes custom clientId in the embed snippet', () => {
    const preferences = {
      ...INITIAL_PREFERENCES,
      clientId: 'Example Site',
    };

    const snippet = buildEmbedSnippet(preferences, String(DEFAULTS.translationId));

    expect(snippet).toContain('clientId=Example+Site');
  });
});
