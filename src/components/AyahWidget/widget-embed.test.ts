import { describe, it, expect } from 'vitest';

import { DEFAULTS, INITIAL_PREFERENCES } from './widget-defaults';
import { buildEmbedSnippet } from './widget-embed';

describe('widget-embed', () => {
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
