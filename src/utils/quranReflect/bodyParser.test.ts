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

it('Keeps HTML links as it is', () => {
  const URL = "<a href='https://bit.ly/QCWK1' target='_blank'>https://bit.ly/QCWK1</a>";
  const actual = parseReflectionBody(URL, '');

  expect(actual).toBe(URL);
});
it('Converts string links to HTML tags correctly', () => {
  const actual = parseReflectionBody('https://bit.ly/QCWK1', '');
  expect(actual).toBe("<a href='https://bit.ly/QCWK1' target='_blank'>https://bit.ly/QCWK1</a>");
});
