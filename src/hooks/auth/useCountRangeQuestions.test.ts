/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import { normalizeQuestionsData } from './useCountRangeQuestions';

// Local type definition to avoid importing from api.ts which has complex dependencies
type QuestionsData = { types: Record<string, number>; total: number };

describe('normalizeQuestionsData', () => {
  it('should normalize lowercase first letter type keys to uppercase', () => {
    // API returns malformed keys like "cLARIFICATION" instead of "CLARIFICATION"
    const input: Record<string, QuestionsData> = {
      '2:6': {
        types: {
          cLARIFICATION: 2,
          tAFSIR: 1,
        },
        total: 3,
      },
    };

    const result = normalizeQuestionsData(input);

    expect(result['2:6'].types.CLARIFICATION).toBe(2);
    expect(result['2:6'].types.TAFSIR).toBe(1);
    expect(result['2:6'].total).toBe(3);
  });

  it('should handle already uppercase type keys', () => {
    const input: Record<string, QuestionsData> = {
      '2:7': {
        types: {
          CLARIFICATION: 1,
        },
        total: 1,
      },
    };

    const result = normalizeQuestionsData(input);

    expect(result['2:7'].types.CLARIFICATION).toBe(1);
    expect(result['2:7'].total).toBe(1);
  });

  it('should handle empty types object', () => {
    const input: Record<string, QuestionsData> = {
      '2:9': {
        types: {},
        total: 0,
      },
    };

    const result = normalizeQuestionsData(input);

    expect(result['2:9'].types).toEqual({});
    expect(result['2:9'].total).toBe(0);
  });

  it('should handle multiple verse keys', () => {
    const input: Record<string, QuestionsData> = {
      '2:6': {
        types: { cLARIFICATION: 2 },
        total: 2,
      },
      '2:7': {
        types: { tAFSIR: 1 },
        total: 1,
      },
      '2:8': {
        types: {},
        total: 0,
      },
    };

    const result = normalizeQuestionsData(input);

    expect(result['2:6'].types.CLARIFICATION).toBe(2);
    expect(result['2:7'].types.TAFSIR).toBe(1);
    expect(result['2:8'].types).toEqual({});
  });

  it('should handle fully lowercase type keys', () => {
    const input: Record<string, QuestionsData> = {
      '3:1': {
        types: {
          clarification: 1,
          tafsir: 2,
        },
        total: 3,
      },
    };

    const result = normalizeQuestionsData(input);

    expect(result['3:1'].types.CLARIFICATION).toBe(1);
    expect(result['3:1'].types.TAFSIR).toBe(2);
  });
});
