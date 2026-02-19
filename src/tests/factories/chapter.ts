import merge from 'lodash/merge';

import { chapter } from '../../../tests/mocks/chapters';

import type Chapter from '@/types/Chapter';

export const makeChapter = (overrides: Partial<Chapter> = {}): Chapter =>
  merge({ ...chapter }, overrides) as Chapter;
