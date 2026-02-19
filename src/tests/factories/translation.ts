import merge from 'lodash/merge';

import type Translation from '@/types/Translation';

const defaults: Translation = {
  id: 722482,
  languageName: 'english',
  text: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
  resourceName: 'Dr. Mustafa Khattab',
  resourceId: 102,
};

export const makeTranslation = (overrides: Partial<Translation> = {}): Translation =>
  merge({}, defaults, overrides) as Translation;
