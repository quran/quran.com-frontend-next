/* eslint-disable @typescript-eslint/naming-convention, react-func/max-lines-per-function, max-lines */
import { Translate } from 'next-translate';
import { describe, it, expect } from 'vitest';

import { FormErrorId } from './types';
import {
  getTranslationFeedbackErrors,
  isTranslationFeedbackValid,
  MAX_FEEDBACK_CHARS,
  MIN_FEEDBACK_CHARS,
} from './validation';

describe('getTranslationFeedbackErrors', () => {
  const mockT = ((key: string) => key) as Translate;

  it('returns empty errors when all fields are valid', () => {
    const errors = getTranslationFeedbackErrors('1', 'Valid feedback text', mockT, 'en');
    expect(errors).toEqual({});
  });

  it('returns translation error when translation is not selected', () => {
    const errors = getTranslationFeedbackErrors('', 'Valid feedback text', mockT, 'en');
    expect(errors).toMatchObject({
      translation: {
        id: FormErrorId.RequiredField,
      },
    });
  });

  it('returns feedback error when feedback is empty', () => {
    const errors = getTranslationFeedbackErrors('1', '', mockT, 'en');
    expect(errors).toMatchObject({
      feedback: {
        id: FormErrorId.RequiredField,
      },
    });
  });

  it('returns feedback error when feedback is only whitespace', () => {
    const errors = getTranslationFeedbackErrors('1', '   ', mockT, 'en');
    expect(errors).toMatchObject({
      feedback: {
        id: FormErrorId.RequiredField,
      },
    });
  });

  it('returns feedback error when feedback is too short', () => {
    const shortFeedback = 'a'.repeat(MIN_FEEDBACK_CHARS - 1);
    const errors = getTranslationFeedbackErrors('1', shortFeedback, mockT, 'en');

    if (MIN_FEEDBACK_CHARS > 1) {
      expect(errors).toMatchObject({
        feedback: {
          id: FormErrorId.MinimumLength,
        },
      });
    } else {
      expect(errors).toMatchObject({
        feedback: {
          id: FormErrorId.RequiredField,
        },
      });
    }
  });

  it('returns feedback error when feedback is too long', () => {
    const longFeedback = 'a'.repeat(MAX_FEEDBACK_CHARS + 1);
    const errors = getTranslationFeedbackErrors('1', longFeedback, mockT, 'en');
    expect(errors).toMatchObject({
      feedback: {
        id: FormErrorId.MaximumLength,
      },
    });
  });

  it('returns multiple errors when both fields are invalid', () => {
    const errors = getTranslationFeedbackErrors('', '', mockT, 'en');
    expect(errors).toMatchObject({
      translation: {
        id: FormErrorId.RequiredField,
      },
      feedback: {
        id: FormErrorId.RequiredField,
      },
    });
  });

  it('returns all validation errors when multiple issues exist', () => {
    const errors = getTranslationFeedbackErrors(
      '',
      'a'.repeat(MAX_FEEDBACK_CHARS + 1),
      mockT,
      'en',
    );
    expect(errors).toMatchObject({
      translation: {
        id: FormErrorId.RequiredField,
      },
      feedback: {
        id: FormErrorId.MaximumLength,
      },
    });
  });
});

describe('isTranslationFeedbackValid', () => {
  it('returns true when errors object is empty', () => {
    const result = isTranslationFeedbackValid({});
    expect(result).toBe(true);
  });

  it('returns false when errors object has translation error', () => {
    const result = isTranslationFeedbackValid({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });

  it('returns false when errors object has feedback error', () => {
    const result = isTranslationFeedbackValid({
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });

  it('returns false when errors object has both errors', () => {
    const result = isTranslationFeedbackValid({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });
});
