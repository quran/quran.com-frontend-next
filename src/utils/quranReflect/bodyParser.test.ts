import { it, expect, describe } from 'vitest';

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

describe('parseReflectionBody', () => {
  const hashtagStyle = 'hashtag-link';

  describe('URL parsing', () => {
    it('should convert simple URLs to links', () => {
      const input = 'Check out https://example.com for more info';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(
        "<a href='https://example.com' target='_blank'>https://example.com</a>",
      );
    });

    it('should handle URLs with hash fragments', () => {
      const input = 'Visit https://altadabbur.com/#aya=2_18';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(
        "<a href='https://altadabbur.com/#aya=2_18' target='_blank'>https://altadabbur.com/#aya=2_18</a>",
      );
    });

    it('should handle URLs with query parameters', () => {
      const input = 'Link: https://example.com/page?id=123&name=test';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(
        "<a href='https://example.com/page?id=123&name=test' target='_blank'>",
      );
    });

    it('should not convert hashtags inside URL hash fragments to hashtag links', () => {
      const input = 'https://altadabbur.com/#aya=2_20';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).not.toContain(`class="${hashtagStyle}">#aya</a>`);
      expect(result).toContain("<a href='https://altadabbur.com/#aya=2_20' target='_blank'>");
    });
  });

  describe('Hashtag parsing', () => {
    it('should convert simple hashtags to links', () => {
      const input = 'This is a #test hashtag';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`class="${hashtagStyle}">#test</a>`);
    });

    it('should handle multiple hashtags', () => {
      const input = '#Adnan #محمد #test';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`>#Adnan</a>`);
      expect(result).toContain(`>#محمد</a>`);
      expect(result).toContain(`>#test</a>`);
    });

    it('should handle Arabic hashtags', () => {
      const input = 'هذا #اختبار عربي';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`>#اختبار</a>`);
    });

    it('should handle consecutive hashtags without spaces', () => {
      const input = '#Adnan#محمد#test';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`>#Adnan</a>`);
      expect(result).toContain(`>#محمد</a>`);
      expect(result).toContain(`>#test</a>`);
    });

    it('should handle hashtags with numbers', () => {
      const input = '#test123 #123test';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`>#test123</a>`);
      expect(result).toContain(`>#123test</a>`);
    });

    it('should handle hashtags with underscores and hyphens', () => {
      const input = '#test_tag #test-tag';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(`>#test_tag</a>`);
      expect(result).toContain(`>#test-tag</a>`);
    });
  });

  describe('Newline handling', () => {
    it('should convert newlines to <br> tags', () => {
      const input = 'Line 1\nLine 2\r\nLine 3';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain('Line 1<br>Line 2<br>Line 3');
    });
  });

  describe('Combined scenarios', () => {
    it('should handle URLs and hashtags together', () => {
      const input = 'Check https://example.com and #hashtag';
      const result = parseReflectionBody(input, hashtagStyle);
      expect(result).toContain(
        "<a href='https://example.com' target='_blank'>https://example.com</a>",
      );
      expect(result).toContain(`>#hashtag</a>`);
    });

    it('should not treat URL hash as a hashtag', () => {
      const input = 'Visit https://site.com/#section and use #realhashtag';
      const result = parseReflectionBody(input, hashtagStyle);
      // The #section should be part of the URL, not a separate hashtag
      expect(result).toContain('https://site.com/#section');
      // The #realhashtag should be converted
      expect(result).toContain(`>#realhashtag</a>`);
    });
  });
});
