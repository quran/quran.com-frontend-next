import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

const COLLECTION_NAME_MIN_LENGTH = 1;
const COLLECTION_NAME_MAX_LENGTH = 255;
const NON_WHITESPACE_REGEX = '\\S';

const getNewCollectionNameRules = (t: any, fieldName: string) => [
  { type: RuleType.Required, value: true, errorMessage: 'Required' },
  {
    type: RuleType.MinimumLength,
    value: COLLECTION_NAME_MIN_LENGTH,
    errorMessage: t('common:errors.min', {
      fieldName,
      min: COLLECTION_NAME_MIN_LENGTH,
    }),
  },
  {
    type: RuleType.MaximumLength,
    value: COLLECTION_NAME_MAX_LENGTH,
    errorMessage: t('common:errors.max', {
      fieldName,
      max: COLLECTION_NAME_MAX_LENGTH,
    }),
  },
  {
    name: 'hasNonWhitespace',
    type: RuleType.Regex,
    value: NON_WHITESPACE_REGEX,
    errorMessage: t('common:errors.required', { fieldName }),
  },
];

const getNewCollectionNameFormFields = (t: any): FormBuilderFormField[] => [
  {
    field: 'name',
    placeholder: t('quran-reader:new-collection-name'),
    rules: getNewCollectionNameRules(t, t('collection:collection-name')),
    type: FormFieldType.Text,
  },
];

export default getNewCollectionNameFormFields;
