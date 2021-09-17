import { decamelizeKeys } from 'humps';

import stringify from './qs-stringify';

it('can stringify object', () => {
  const input = {
    words: true,
    translations: '149',
    translationFields: 'resource_name',
    limit: 10,
    fields: 'text_uthmani,chapter_id',
    reciter: 5,
    page: 1,
    mushaf: 4,
    wordFields: 'verse_key, verse_id, page_number, location, text_uthmani, text_indopak',
  };

  const result = stringify(decamelizeKeys(input));
  const expected =
    'words=true&translations=149&translation_fields=resource_name&limit=10&fields=text_uthmani%2Cchapter_id&reciter=5&page=1&mushaf=4&word_fields=verse_key%2C%20verse_id%2C%20page_number%2C%20location%2C%20text_uthmani%2C%20text_indopak';

  expect(result).toBe(expected);
});
