import { describe, it, expect, vi } from 'vitest';

import reducer, {
  setShowTajweedRules,
  selectShowTajweedRules,
} from '@/redux/slices/QuranReader/styles';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont } from '@/types/QuranReader';

vi.mock('@/redux/defaultSettings/util', () => ({
  getQuranReaderStylesInitialState: () => ({
    tafsirFontScale: 3,
    reflectionFontScale: 3,
    lessonFontScale: 3,
    quranTextFontScale: 3,
    translationFontScale: 3,
    wordByWordFontScale: 3,
    qnaFontScale: 3,
    quranFont: 'code_v1',
    mushafLines: '16Lines',
    isUsingDefaultFont: true,
    showTajweedRules: true,
  }),
}));

const initialState: QuranReaderStyles = {
  tafsirFontScale: 3,
  reflectionFontScale: 3,
  lessonFontScale: 3,
  quranTextFontScale: 3,
  translationFontScale: 3,
  wordByWordFontScale: 3,
  qnaFontScale: 3,
  quranFont: QuranFont.MadaniV1,
  mushafLines: MushafLines.SixteenLines,
  isUsingDefaultFont: true,
  showTajweedRules: true,
};

describe('quranReaderStyles slice - showTajweedRules', () => {
  describe('setShowTajweedRules', () => {
    it('should set showTajweedRules to false', () => {
      const result = reducer(initialState, setShowTajweedRules(false));
      expect(result.showTajweedRules).toBe(false);
    });

    it('should set showTajweedRules to true', () => {
      const stateWithFalse = { ...initialState, showTajweedRules: false };
      const result = reducer(stateWithFalse, setShowTajweedRules(true));
      expect(result.showTajweedRules).toBe(true);
    });

    it('should preserve other state properties', () => {
      const result = reducer(initialState, setShowTajweedRules(false));
      expect(result.quranFont).toBe(initialState.quranFont);
      expect(result.quranTextFontScale).toBe(initialState.quranTextFontScale);
      expect(result.mushafLines).toBe(initialState.mushafLines);
    });
  });

  describe('selectShowTajweedRules', () => {
    it('should return true from initial state', () => {
      const mockState = { quranReaderStyles: initialState } as any;
      expect(selectShowTajweedRules(mockState)).toBe(true);
    });

    it('should return false when showTajweedRules is false', () => {
      const mockState = {
        quranReaderStyles: { ...initialState, showTajweedRules: false },
      } as any;
      expect(selectShowTajweedRules(mockState)).toBe(false);
    });
  });
});
