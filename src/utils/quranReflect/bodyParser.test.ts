import { it, expect } from 'vitest';

import { parseReflectionBody } from './bodyParser';
import { getQuranReflectTagUrl } from './navigation';

it('parses basic text successfully', () => {
  const actual = parseReflectionBody('reflectionBody', 'hashtagStyle');

  expect(actual).toBe('reflectionBody');
});

it('converts a body containing only 1 hashtag to a link successfully', () => {
  const actual = parseReflectionBody('#Week1', 'hashtagStyle');

  expect(actual).toBe(
    `<a target="_blank" href="${getQuranReflectTagUrl('#Week1')}" class="hashtagStyle">#Week1</a>`,
  );
});
