import { describe, expect, it } from 'vitest';

import { parseContentChunks, parseQuranUrl } from './lessonContentParser';

describe('lessonContentParser', () => {
  describe('parseQuranUrl', () => {
    it('parses supported quran.com URL formats', () => {
      expect(parseQuranUrl('https://quran.com/2/255')).toEqual({ chapter: 2, from: 255 });
      expect(parseQuranUrl('https://quran.com/2/255-257')).toEqual({
        chapter: 2,
        from: 255,
        to: 257,
      });
      expect(parseQuranUrl('https://quran.com/2:255')).toEqual({ chapter: 2, from: 255 });
      expect(parseQuranUrl('https://quran.com/2:255-257')).toEqual({
        chapter: 2,
        from: 255,
        to: 257,
      });
      expect(parseQuranUrl('https://quran.com/2-255')).toEqual({ chapter: 2, from: 255 });
      expect(parseQuranUrl('https://ar.quran.com/2:255')).toEqual({ chapter: 2, from: 255 });
    });

    it('rejects non-quran.com hosts', () => {
      expect(parseQuranUrl('https://quran.com.evil.com/2:255')).toBeNull();
      expect(parseQuranUrl('https://notquran.com/2:255')).toBeNull();
      expect(parseQuranUrl('not-a-url')).toBeNull();
    });
  });

  describe('parseContentChunks', () => {
    it('returns a single html chunk when no quran links exist', () => {
      const html =
        '<p>Intro</p><blockquote><a href="https://example.com/x">x</a></blockquote><p>End</p>';

      expect(parseContentChunks(html)).toEqual([{ type: 'html', key: 'html-0', content: html }]);
    });

    it('replaces eligible quran blockquotes and keeps surrounding html', () => {
      const html =
        '<p>Before</p><blockquote><a href="https://quran.com/18:1-2">Ayah</a></blockquote><p>After</p>';
      const chunks = parseContentChunks(html);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toMatchObject({ type: 'html' });
      expect(chunks[1]).toMatchObject({
        type: 'verse',
        reference: { chapter: 18, from: 1, to: 2 },
        originalHtml: '<blockquote><a href="https://quran.com/18:1-2">Ayah</a></blockquote>',
      });
      expect(chunks[2]).toMatchObject({ type: 'html' });
    });

    it('keeps non-quran blockquotes inside html chunks between verse widgets', () => {
      const html =
        '<p>Start</p><blockquote><a href="https://example.com/a">Nope</a></blockquote><blockquote><a href="https://quran.com/1:1">Yes</a></blockquote><p>End</p>';
      const chunks = parseContentChunks(html);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toMatchObject({ type: 'html' });
      expect((chunks[0] as { content: string }).content).toContain(
        '<blockquote><a href="https://example.com/a">Nope</a></blockquote>',
      );
      expect(chunks[1]).toMatchObject({
        type: 'verse',
        reference: { chapter: 1, from: 1 },
      });
      expect(chunks[2]).toMatchObject({ type: 'html' });
    });

    it('parses first quran link when a blockquote has multiple links', () => {
      const html =
        '<blockquote><a href="https://example.com/a">x</a><a href="https://quran.com/2:1">first</a><a href="https://quran.com/2:2">second</a></blockquote>';
      const chunks = parseContentChunks(html);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toMatchObject({
        type: 'verse',
        reference: { chapter: 2, from: 1 },
      });
    });

    it('parses trailing chapter:verse from all blockquotes and keeps trailing html', () => {
      const html =
        '<blockquote><p>“One.” (67:1)</p></blockquote><blockquote><p>“Two.” (67:2)</p></blockquote><blockquote><p>“Three.” (67:3)</p></blockquote><p>Tail</p>';
      const chunks = parseContentChunks(html);

      expect(chunks).toHaveLength(4);
      expect(chunks[0]).toMatchObject({
        type: 'verse',
        reference: { chapter: 67, from: 1 },
      });
      expect(chunks[1]).toMatchObject({
        type: 'verse',
        reference: { chapter: 67, from: 2 },
      });
      expect(chunks[2]).toMatchObject({
        type: 'verse',
        reference: { chapter: 67, from: 3 },
      });
      expect(chunks[3]).toMatchObject({ type: 'html' });
    });
  });
});
