/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';

import Alignment from '../../types/Media/Alignment';
import Orientation from '../../types/Media/Orientation';
import { QuranFont } from '../../types/QuranReader';

import {
  isValidTranslationsQueryParamValueWithExistingKey,
  isValidReciterId,
  isValidBooleanQueryParamValue,
  isValidNumberQueryParamValue,
  isValidFontScaleQueryParamValue,
  isValidAlignmentQueryParamValue,
  isValidOrientationQueryParamValue,
  isValidOpacityQueryParamValue,
  isValidVideoIdQueryParamValue,
  isValidFontStyleQueryParamValue,
} from './queryParamValidator';

import AvailableTranslation from '@/types/AvailableTranslation';
import Reciter from '@/types/Reciter';

const reciters = [
  {
    id: 7,
    reciterId: 1,
    name: 'Mishari Rashid al-`Afasy',
    translatedName: {
      name: 'Mishari Rashid al-`Afasy',
      languageName: 'english',
    },
    style: {
      name: 'Murattal',
      languageName: 'english',
      description: 'Murattal is Quranic recitation at a slower pace, used for study and practice.',
    },
    qirat: {
      name: 'Hafs',
      languageName: 'english',
    },
  },
] as Reciter[];

const translations = [
  {
    id: 131,
    name: 'Dr. Mustafa Khattab, The Clear Quran',
    authorName: 'Dr. Mustafa Khattab',
    slug: 'clearquran-with-tafsir',
    languageName: 'english',
    translatedName: {
      name: 'Dr. Mustafa Khattab',
      languageName: 'english',
    },
  },
] as AvailableTranslation[];

describe('isValidTranslationsQueryParamValueWithExistingKey', () => {
  it('Returns true when empty', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('', translations)).toBe(true);
  });
  it('Returns true when 1 valid translation id exists', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131', translations)).toBe(true);
  });
  it('Returns false when 1 invalid translation id exists', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('99', translations)).toBe(false);
  });
  it('Returns false when 1 invalid translation id and 1 empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('sdfsdf,', translations)).toBe(false);
  });
  it('Returns false when 1 valid id and 1 empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131,', translations)).toBe(false);
  });
  it('Returns false when a valid id and an empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131,', translations)).toBe(false);
  });
  it('Returns false when an invalid translation id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('123,131,85', translations)).toBe(
      false,
    );
  });
  it('Returns false when one of many ids is not valid', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('123,sdfsdf,1234', translations)).toBe(
      false,
    );
  });
});

describe('isValidReciterId', () => {
  it('Returns false when empty', () => {
    expect(isValidReciterId('', reciters)).toBe(false);
  });
  it('Returns true when a valid reciter id exists', () => {
    expect(isValidReciterId('7', reciters)).toBe(true);
  });
  it('Returns false when 1 invalid reciter id exists', () => {
    expect(isValidReciterId('sdfsdfdf', reciters)).toBe(false);
  });
});

describe('isValidBooleanQueryParamValue', () => {
  it('Returns false when strings', () => {
    expect(isValidBooleanQueryParamValue('invalid1')).toBe(false);
  });
  it('Returns false for numbers', () => {
    expect(isValidBooleanQueryParamValue('invalid1')).toBe(false);
  });
  it('Returns true for True', () => {
    expect(isValidBooleanQueryParamValue('true')).toBe(true);
  });
  it('Returns true for False', () => {
    expect(isValidBooleanQueryParamValue('false')).toBe(true);
  });
});

describe('isValidNumberQueryParamValue', () => {
  it('Returns true for valid number', () => {
    expect(isValidNumberQueryParamValue('123')).toBe(true);
  });
  it('Returns false for invalid number', () => {
    expect(isValidNumberQueryParamValue('abc')).toBe(false);
  });
});

describe('isValidFontScaleQueryParamValue', () => {
  it('Returns true for valid font scale', () => {
    expect(isValidFontScaleQueryParamValue('5')).toBe(true);
  });
  it('Returns false for invalid font scale', () => {
    expect(isValidFontScaleQueryParamValue('11')).toBe(false);
  });
});

describe('isValidAlignmentQueryParamValue', () => {
  it('Returns true for valid alignment', () => {
    expect(isValidAlignmentQueryParamValue(Alignment.CENTRE)).toBe(true);
  });
  it('Returns true for valid alignment', () => {
    expect(isValidAlignmentQueryParamValue(Alignment.JUSTIFIED)).toBe(true);
  });
  it('Returns false for invalid alignment', () => {
    expect(isValidAlignmentQueryParamValue('test')).toBe(false);
  });
});

describe('isValidOrientationQueryParamValue', () => {
  it('Returns true for valid orientation', () => {
    expect(isValidOrientationQueryParamValue(Orientation.LANDSCAPE)).toBe(true);
  });
  it('Returns true for valid orientation', () => {
    expect(isValidOrientationQueryParamValue(Orientation.PORTRAIT)).toBe(true);
  });
  it('Returns false for invalid orientation', () => {
    expect(isValidOrientationQueryParamValue('sdfsdfsdf')).toBe(false);
  });
});

describe('isValidOpacityQueryParamValue', () => {
  it('Returns true for valid opacity', () => {
    expect(isValidOpacityQueryParamValue(0.6)).toBe(true);
  });
  it('Returns false for invalid opacity', () => {
    expect(isValidOpacityQueryParamValue(0.5)).toBe(false);
  });
  it('Returns false for invalid opacity', () => {
    expect(isValidOpacityQueryParamValue(null)).toBe(false);
  });
});

describe('isValidVideoIdQueryParamValue', () => {
  it('Returns true for valid video id', () => {
    expect(isValidVideoIdQueryParamValue('3')).toBe(true);
  });
  it('Returns false for invalid video id', () => {
    expect(isValidVideoIdQueryParamValue('7')).toBe(false);
  });
  it('Returns false for invalid video id', () => {
    expect(isValidVideoIdQueryParamValue('test')).toBe(false);
  });
  it('Returns false for invalid video id', () => {
    expect(isValidVideoIdQueryParamValue(null)).toBe(false);
  });
});

describe('isValidFontStyleQueryParamValue', () => {
  it('should return true for valid QuranFont values', () => {
    expect(isValidFontStyleQueryParamValue(QuranFont.MadaniV1)).toBe(true);
    expect(isValidFontStyleQueryParamValue(QuranFont.MadaniV2)).toBe(true);
    expect(isValidFontStyleQueryParamValue(QuranFont.Uthmani)).toBe(true);
    expect(isValidFontStyleQueryParamValue(QuranFont.IndoPak)).toBe(true);
    expect(isValidFontStyleQueryParamValue(QuranFont.QPCHafs)).toBe(true);
    expect(isValidFontStyleQueryParamValue(QuranFont.Tajweed)).toBe(true);
  });

  it('should return false for invalid QuranFont values', () => {
    expect(isValidFontStyleQueryParamValue('invalid_value' as QuranFont)).toBe(false);
    expect(isValidFontStyleQueryParamValue('' as QuranFont)).toBe(false);
    expect(isValidFontStyleQueryParamValue('text_madani' as QuranFont)).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidFontStyleQueryParamValue(123 as unknown as QuranFont)).toBe(false);
    expect(isValidFontStyleQueryParamValue(null as unknown as QuranFont)).toBe(false);
    expect(isValidFontStyleQueryParamValue(undefined as unknown as QuranFont)).toBe(false);
    expect(isValidFontStyleQueryParamValue({} as unknown as QuranFont)).toBe(false);
  });
});
