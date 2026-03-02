/* eslint-disable max-lines */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { decodeHTMLEntities } from './utility';

/**
 * Test suite for decodeHTMLEntities utility function
 * Tests HTML entity decoding including common entities, numeric entities, and edge cases
 */

describe('decodeHTMLEntities', () => {
  // Mock document object for tests that run in environments without DOM
  let originalDocument: typeof document;

  beforeEach(() => {
    originalDocument = global.document;
  });

  afterEach(() => {
    if (originalDocument) {
      global.document = originalDocument;
    }
  });

  describe('Basic HTML Entities', () => {
    it('should decode &gt; to >', () => {
      expect(decodeHTMLEntities('&gt;')).toBe('>');
    });

    it('should decode &lt; to <', () => {
      expect(decodeHTMLEntities('&lt;')).toBe('<');
    });

    it('should decode &amp; to &', () => {
      expect(decodeHTMLEntities('&amp;')).toBe('&');
    });

    it('should decode &quot; to "', () => {
      expect(decodeHTMLEntities('&quot;')).toBe('"');
    });

    it("should decode &apos; to '", () => {
      expect(decodeHTMLEntities('&apos;')).toBe("'");
    });

    it('should decode &nbsp; to non-breaking space', () => {
      const result = decodeHTMLEntities('&nbsp;');
      expect(result).toBe('\u00A0');
    });
  });

  describe('Multiple Entities in One String', () => {
    it('should decode multiple entities in a single string', () => {
      expect(decodeHTMLEntities('&lt;div&gt;&amp;&lt;/div&gt;')).toBe('<div>&</div>');
    });

    it('should decode mixed entities and text', () => {
      expect(decodeHTMLEntities('5 &gt; 3 &amp; 3 &lt; 10')).toBe('5 > 3 & 3 < 10');
    });

    it('should decode entities at the beginning of string', () => {
      expect(decodeHTMLEntities('&lt;p&gt;Hello')).toBe('<p>Hello');
    });

    it('should decode entities at the end of string', () => {
      expect(decodeHTMLEntities('Hello&lt;/p&gt;')).toBe('Hello</p>');
    });

    it('should decode entities in the middle of string', () => {
      expect(decodeHTMLEntities('Hello &amp; World')).toBe('Hello & World');
    });
  });

  describe('Numeric HTML Entities', () => {
    it('should decode decimal numeric entities', () => {
      expect(decodeHTMLEntities('&#60;')).toBe('<');
      expect(decodeHTMLEntities('&#62;')).toBe('>');
      expect(decodeHTMLEntities('&#38;')).toBe('&');
    });

    it('should decode hexadecimal numeric entities', () => {
      expect(decodeHTMLEntities('&#x3C;')).toBe('<');
      expect(decodeHTMLEntities('&#x3E;')).toBe('>');
      expect(decodeHTMLEntities('&#x26;')).toBe('&');
    });

    it('should decode mixed case hexadecimal entities', () => {
      expect(decodeHTMLEntities('&#x3c;')).toBe('<');
      expect(decodeHTMLEntities('&#x3C;')).toBe('<');
    });
  });

  describe('Special Characters and Symbols', () => {
    it('should decode &copy; to ©', () => {
      expect(decodeHTMLEntities('&copy;')).toBe('©');
    });

    it('should decode &reg; to ®', () => {
      expect(decodeHTMLEntities('&reg;')).toBe('®');
    });

    it('should decode &trade; to ™', () => {
      expect(decodeHTMLEntities('&trade;')).toBe('™');
    });

    it('should decode &euro; to €', () => {
      expect(decodeHTMLEntities('&euro;')).toBe('€');
    });

    it('should decode &pound; to £', () => {
      expect(decodeHTMLEntities('&pound;')).toBe('£');
    });

    it('should decode &cent; to ¢', () => {
      expect(decodeHTMLEntities('&cent;')).toBe('¢');
    });

    it('should decode &yen; to ¥', () => {
      expect(decodeHTMLEntities('&yen;')).toBe('¥');
    });
  });

  describe('Mathematical Symbols', () => {
    it('should decode &plusmn; to ±', () => {
      expect(decodeHTMLEntities('&plusmn;')).toBe('±');
    });

    it('should decode &times; to ×', () => {
      expect(decodeHTMLEntities('&times;')).toBe('×');
    });

    it('should decode &divide; to ÷', () => {
      expect(decodeHTMLEntities('&divide;')).toBe('÷');
    });

    it('should decode &ne; to ≠', () => {
      expect(decodeHTMLEntities('&ne;')).toBe('≠');
    });

    it('should decode &le; to ≤', () => {
      expect(decodeHTMLEntities('&le;')).toBe('≤');
    });

    it('should decode &ge; to ≥', () => {
      expect(decodeHTMLEntities('&ge;')).toBe('≥');
    });
  });

  describe('Punctuation and Quotes', () => {
    it('should decode &lsquo; to left single quote', () => {
      expect(decodeHTMLEntities('&lsquo;')).toBe('‘');
    });

    it('should decode &rsquo; to right single quote', () => {
      expect(decodeHTMLEntities('&rsquo;')).toBe('’');
    });

    it('should decode &ldquo; to left double quote', () => {
      expect(decodeHTMLEntities('&ldquo;')).toBe('\u201C');
    });

    it('should decode &rdquo; to right double quote', () => {
      expect(decodeHTMLEntities('&rdquo;')).toBe('\u201D');
    });

    it('should decode &hellip; to ellipsis', () => {
      expect(decodeHTMLEntities('&hellip;')).toBe('…');
    });

    it('should decode &mdash; to em dash', () => {
      expect(decodeHTMLEntities('&mdash;')).toBe('—');
    });

    it('should decode &ndash; to en dash', () => {
      expect(decodeHTMLEntities('&ndash;')).toBe('–');
    });
  });

  describe('Arrows and Special Symbols', () => {
    it('should decode &larr; to ←', () => {
      expect(decodeHTMLEntities('&larr;')).toBe('←');
    });

    it('should decode &rarr; to →', () => {
      expect(decodeHTMLEntities('&rarr;')).toBe('→');
    });

    it('should decode &uarr; to ↑', () => {
      expect(decodeHTMLEntities('&uarr;')).toBe('↑');
    });

    it('should decode &darr; to ↓', () => {
      expect(decodeHTMLEntities('&darr;')).toBe('↓');
    });

    it('should decode &harr; to ↔', () => {
      expect(decodeHTMLEntities('&harr;')).toBe('↔');
    });
  });

  describe('Accented Characters', () => {
    it('should decode common accented characters', () => {
      expect(decodeHTMLEntities('&eacute;')).toBe('é');
      expect(decodeHTMLEntities('&egrave;')).toBe('è');
      expect(decodeHTMLEntities('&ecirc;')).toBe('ê');
      expect(decodeHTMLEntities('&auml;')).toBe('ä');
      expect(decodeHTMLEntities('&ouml;')).toBe('ö');
      expect(decodeHTMLEntities('&uuml;')).toBe('ü');
    });

    it('should decode capital accented characters', () => {
      expect(decodeHTMLEntities('&Aacute;')).toBe('Á');
      expect(decodeHTMLEntities('&Egrave;')).toBe('È');
      expect(decodeHTMLEntities('&Ouml;')).toBe('Ö');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty string when given empty string', () => {
      expect(decodeHTMLEntities('')).toBe('');
    });

    it('should handle strings with no entities', () => {
      expect(decodeHTMLEntities('Hello World')).toBe('Hello World');
    });

    it('should handle whitespace-only strings', () => {
      expect(decodeHTMLEntities('   ')).toBe('   ');
    });

    it('should handle newlines and tabs', () => {
      const input = 'Line 1\nLine 2\tTabbed';
      expect(decodeHTMLEntities(input)).toBe(input);
    });

    it('should handle consecutive entities', () => {
      expect(decodeHTMLEntities('&amp;&amp;&amp;')).toBe('&&&');
    });

    it('should handle nested entities', () => {
      expect(decodeHTMLEntities('&amp;gt;')).toBe('&gt;');
    });

    it('should handle mixed named and numeric entities', () => {
      expect(decodeHTMLEntities('&lt;&#62;&amp;')).toBe('<>&');
    });
  });

  describe('Real-World Use Cases', () => {
    it('should decode HTML from user input in notes', () => {
      const userNote = 'This verse is &gt; amazing &amp; wonderful &lt;3';
      expect(decodeHTMLEntities(userNote)).toBe('This verse is > amazing & wonderful <3');
    });

    it('should decode code snippets', () => {
      const code = 'if (x &gt; 5 &amp;&amp; y &lt; 10) { return true; }';
      expect(decodeHTMLEntities(code)).toBe('if (x > 5 && y < 10) { return true; }');
    });

    it('should decode mathematical expressions', () => {
      const math = '2 &times; 2 = 4, 10 &divide; 2 = 5';
      expect(decodeHTMLEntities(math)).toBe('2 × 2 = 4, 10 ÷ 2 = 5');
    });

    it('should decode quoted text', () => {
      const quoted = '&ldquo;To be or not to be&rdquo; &mdash; Shakespeare';
      expect(decodeHTMLEntities(quoted)).toBe('\u201CTo be or not to be\u201D — Shakespeare');
    });

    it('should decode URLs with entities', () => {
      const url = 'https://example.com?foo=1&amp;bar=2&amp;baz=3';
      expect(decodeHTMLEntities(url)).toBe('https://example.com?foo=1&bar=2&baz=3');
    });

    it('should handle mixed content with newlines', () => {
      const content = 'Line 1: &lt;p&gt;\nLine 2: &amp;\nLine 3: &gt;';
      expect(decodeHTMLEntities(content)).toBe('Line 1: <p>\nLine 2: &\nLine 3: >');
    });
  });

  describe('Type Safety', () => {
    it('should return non-string values as-is', () => {
      expect(decodeHTMLEntities(null as any)).toBe(null);
      expect(decodeHTMLEntities(undefined as any)).toBe(undefined);
      expect(decodeHTMLEntities(123 as any)).toBe(123);
      expect(decodeHTMLEntities({} as any)).toEqual({});
      expect(decodeHTMLEntities([] as any)).toEqual([]);
    });

    it('should handle number strings', () => {
      expect(decodeHTMLEntities('123')).toBe('123');
    });
  });

  describe('Server-Side Rendering (SSR) Compatibility', () => {
    it('should return original text when document is undefined', () => {
      // Simulate SSR environment
      delete (global as any).document;

      const input = '&lt;div&gt;Hello&lt;/div&gt;';
      expect(decodeHTMLEntities(input)).toBe(input);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle Arabic text with entities', () => {
      const arabic = 'القرآن &gt; الكريم &amp; العظيم';
      expect(decodeHTMLEntities(arabic)).toBe('القرآن > الكريم & العظيم');
    });

    it('should handle mixed RTL and LTR text with entities', () => {
      const mixed = 'Hello &lt;world&gt; مرحبا &lt;عالم&gt;';
      expect(decodeHTMLEntities(mixed)).toBe('Hello <world> مرحبا <عالم>');
    });

    it('should handle very long strings with many entities', () => {
      const longString = `${'a'.repeat(100)}&amp;${'b'.repeat(100)}&gt;${'c'.repeat(100)}`;
      const expected = `${'a'.repeat(100)}&${'b'.repeat(100)}>${'c'.repeat(100)}`;
      expect(decodeHTMLEntities(longString)).toBe(expected);
    });

    it('should handle emoji with entities', () => {
      const emojiText = 'Hello &amp; welcome! 👋 &lt;3';
      expect(decodeHTMLEntities(emojiText)).toBe('Hello & welcome! 👋 <3');
    });
  });

  describe('Less Common Entities', () => {
    it('should decode degree symbol', () => {
      expect(decodeHTMLEntities('&deg;')).toBe('°');
    });

    it('should decode micro symbol', () => {
      expect(decodeHTMLEntities('&micro;')).toBe('µ');
    });

    it('should decode paragraph symbol', () => {
      expect(decodeHTMLEntities('&para;')).toBe('¶');
    });

    it('should decode section symbol', () => {
      expect(decodeHTMLEntities('&sect;')).toBe('§');
    });

    it('should decode middle dot', () => {
      expect(decodeHTMLEntities('&middot;')).toBe('·');
    });
  });

  describe('Greek Letters', () => {
    it('should decode common Greek letters', () => {
      expect(decodeHTMLEntities('&alpha;')).toBe('α');
      expect(decodeHTMLEntities('&beta;')).toBe('β');
      expect(decodeHTMLEntities('&gamma;')).toBe('γ');
      expect(decodeHTMLEntities('&delta;')).toBe('δ');
      expect(decodeHTMLEntities('&pi;')).toBe('π');
      expect(decodeHTMLEntities('&sigma;')).toBe('σ');
      expect(decodeHTMLEntities('&Omega;')).toBe('Ω');
    });
  });
});
