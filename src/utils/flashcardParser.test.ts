import { describe, it, expect } from 'vitest';

import parseFlashcardsFromHtml from './flashcardParser';

import { FlashCardVariant } from '@/components/Course/FlashCards/types';

const WORD_HTML = `<p dir="rtl"><strong>ٱلَّذِى</strong>(<em>alladhī</em>) - The One Who</p>`;

const makeSection = (headingAttrs = '', title = 'Word-by-word breakdown') =>
  `<h3${headingAttrs}>${title}</h3>${WORD_HTML}`;

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
  });
});
