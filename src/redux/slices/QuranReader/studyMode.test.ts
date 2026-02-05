import { describe, it, expect } from 'vitest';

import studyModeReducer, {
  openStudyMode,
  closeStudyMode,
  selectStudyModeShowPinnedSection,
  initialState,
} from './studyMode';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';

// eslint-disable-next-line react-func/max-lines-per-function
describe('studyMode slice', () => {
  describe('initialState', () => {
    it('should have showPinnedSection set to false', () => {
      expect(initialState.showPinnedSection).toBe(false);
    });
  });

  // eslint-disable-next-line react-func/max-lines-per-function
  describe('openStudyMode', () => {
    it('should set showPinnedSection to false when not provided', () => {
      const result = studyModeReducer(initialState, openStudyMode({ verseKey: '1:1' }));
      expect(result.showPinnedSection).toBe(false);
    });

    it('should set showPinnedSection to true when provided', () => {
      const result = studyModeReducer(
        initialState,
        openStudyMode({ verseKey: '1:1', showPinnedSection: true }),
      );
      expect(result.showPinnedSection).toBe(true);
    });

    it('should set showPinnedSection to false when explicitly set to false', () => {
      const result = studyModeReducer(
        initialState,
        openStudyMode({ verseKey: '1:1', showPinnedSection: false }),
      );
      expect(result.showPinnedSection).toBe(false);
    });

    it('should preserve other state properties when setting showPinnedSection', () => {
      const result = studyModeReducer(
        initialState,
        openStudyMode({
          verseKey: '2:255',
          activeTab: StudyModeTabId.TAFSIR,
          highlightedWordLocation: 'word1',
          showPinnedSection: true,
        }),
      );

      expect(result.isOpen).toBe(true);
      expect(result.verseKey).toBe('2:255');
      expect(result.activeTab).toBe('tafsir');
      expect(result.highlightedWordLocation).toBe('word1');
      expect(result.showPinnedSection).toBe(true);
    });
  });

  describe('closeStudyMode', () => {
    it('should reset showPinnedSection to false', () => {
      const stateWithPinnedSection = {
        ...initialState,
        isOpen: true,
        verseKey: '1:1',
        showPinnedSection: true,
      };

      const result = studyModeReducer(stateWithPinnedSection, closeStudyMode());

      expect(result).toEqual(initialState);
      expect(result.showPinnedSection).toBe(false);
    });
  });

  describe('selectStudyModeShowPinnedSection', () => {
    it('should return false from initial state', () => {
      const mockState = { studyMode: initialState } as any;
      expect(selectStudyModeShowPinnedSection(mockState)).toBe(false);
    });

    it('should return true when showPinnedSection is true', () => {
      const stateWithPinnedSection = {
        ...initialState,
        showPinnedSection: true,
      };
      const mockState = { studyMode: stateWithPinnedSection } as any;
      expect(selectStudyModeShowPinnedSection(mockState)).toBe(true);
    });

    it('should return false when showPinnedSection is false', () => {
      const stateWithoutPinnedSection = {
        ...initialState,
        showPinnedSection: false,
      };
      const mockState = { studyMode: stateWithoutPinnedSection } as any;
      expect(selectStudyModeShowPinnedSection(mockState)).toBe(false);
    });
  });
});
