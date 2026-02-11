import { expect, it } from 'vitest';

import getNewCollectionNameFormFields from './getNewCollectionNameFormFields';

import buildReactHookFormRules from '@/components/FormBuilder/buildReactHookFormRules';
import { RuleType } from 'types/FieldRule';

const t = (key: string, params?: Record<string, unknown>) => {
  if (key === 'collection:collection-name') return 'Collection name';
  if (key === 'quran-reader:new-collection-name') return 'New Collection Name';
  if (key === 'common:errors.min') return `MIN_${params?.min}_${params?.fieldName}`;
  if (key === 'common:errors.max') return `MAX_${params?.max}_${params?.fieldName}`;
  if (key === 'common:errors.required') return `REQUIRED_${params?.fieldName}`;

  return key;
};

it('returns the expected collection name field rules', () => {
  const formFields = getNewCollectionNameFormFields(t);
  expect(formFields).toHaveLength(1);

  const [nameField] = formFields;
  expect(nameField.field).toBe('name');
  expect(nameField.placeholder).toBe('New Collection Name');
  expect(nameField.rules).toEqual([
    { type: RuleType.Required, value: true, errorMessage: 'REQUIRED_Collection name' },
    { type: RuleType.MinimumLength, value: 1, errorMessage: 'MIN_1_Collection name' },
    { type: RuleType.MaximumLength, value: 255, errorMessage: 'MAX_255_Collection name' },
    {
      name: 'hasNonWhitespace',
      type: RuleType.Regex,
      value: '\\S',
      errorMessage: 'REQUIRED_Collection name',
    },
  ]);
});

it('enforces collection name validation boundaries', () => {
  const [nameField] = getNewCollectionNameFormFields(t);
  const reactHookFormRules = buildReactHookFormRules(nameField);
  const customValidations = reactHookFormRules.validate as Record<
    string,
    (value: string) => string | true
  >;

  expect(reactHookFormRules.required).toEqual({
    value: true,
    message: 'REQUIRED_Collection name',
  });
  expect(customValidations.minLength('')).toBe('MIN_1_Collection name');
  expect(customValidations.minLength('a')).toBe(true);
  expect(customValidations.maxLength('a'.repeat(255))).toBe(true);
  expect(customValidations.maxLength('a'.repeat(256))).toBe('MAX_255_Collection name');
  expect(customValidations.hasNonWhitespace('   ')).toBe('REQUIRED_Collection name');
  expect(customValidations.hasNonWhitespace('  a  ')).toBe(true);
});
