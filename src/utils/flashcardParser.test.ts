import { describe, it, expect } from 'vitest';

import parseFlashcardsFromHtml from './flashcardParser';

import { FlashCardVariant } from '@/components/Course/FlashCards/types';

const WORD_HTML = `<p dir="rtl"><strong>ٱلَّذِى</strong>(<em>alladhī</em>) - The One Who</p>`;
const WORD_HTML_NO_TRANSLITERATION = `<p dir="rtl"><strong>خَلَقَ</strong> - created</p>`;
const WORD_HTML_EM_DASH = `<p dir="rtl"><strong>رَحْمَة</strong>(<em>raḥmah</em>) — mercy</p>`;

const makeSection = (headingAttrs = '', title = 'Word-by-word breakdown') =>
  `<h3${headingAttrs}>${title}</h3>${WORD_HTML}`;
const makeSectionWithoutTransliteration = (headingAttrs = '', title = 'Word-by-word breakdown') =>
  `<h3${headingAttrs}>${title}</h3>${WORD_HTML_NO_TRANSLITERATION}`;
const makeSectionWithEmDash = (headingAttrs = '', title = 'Word-by-word breakdown') =>
  `<h3${headingAttrs}>${title}</h3>${WORD_HTML_EM_DASH}`;

describe('flashcardParser', () => {
  describe('parseFlashcardsFromHtml', () => {
    it('returns null when no word-by-word section exists', () => {
      expect(parseFlashcardsFromHtml('<p>Hello</p>')).toBeNull();
    });

    it('defaults to list variant when no class on h3', () => {
      const result = parseFlashcardsFromHtml(makeSection());
      expect(result?.variant).toBe(FlashCardVariant.List);
      expect(result?.flashcards).toHaveLength(1);
    });

    it('extracts carousel variant', () => {
      const result = parseFlashcardsFromHtml(makeSection(` class="flashcard-carousel"`));
      expect(result?.variant).toBe(FlashCardVariant.Carousel);
    });

    it('extracts deck variant', () => {
      const result = parseFlashcardsFromHtml(makeSection(` class="flashcard-deck"`));
      expect(result?.variant).toBe(FlashCardVariant.Deck);
    });

    it('splits before/after HTML correctly', () => {
      const html = `<p>Before</p>${makeSection()}<h3>Next section</h3><p>After</p>`;
      const result = parseFlashcardsFromHtml(html);
      expect(result?.beforeHtml).toBe('<p>Before</p>');
      expect(result?.afterHtml).toContain('<h3>Next section</h3>');
    });

    it('parses arabic, transliteration and translation', () => {
      const result = parseFlashcardsFromHtml(makeSection());
      const card = result?.flashcards[0];
      expect(card?.arabic).toBe('ٱلَّذِى');
      expect(card?.transliteration).toBe('alladhī');
      expect(card?.translation).toBe('The One Who');
    });

    it('parses translation when transliteration is missing', () => {
      const result = parseFlashcardsFromHtml(makeSectionWithoutTransliteration());
      const card = result?.flashcards[0];
      expect(card?.arabic).toBe('خَلَقَ');
      expect(card?.transliteration).toBe('');
      expect(card?.translation).toBe('created');
    });

    it('parses translation with em dash separator', () => {
      const result = parseFlashcardsFromHtml(makeSectionWithEmDash());
      const card = result?.flashcards[0];
      expect(card?.arabic).toBe('رَحْمَة');
      expect(card?.transliteration).toBe('raḥmah');
      expect(card?.translation).toBe('mercy');
    });
  });
});
