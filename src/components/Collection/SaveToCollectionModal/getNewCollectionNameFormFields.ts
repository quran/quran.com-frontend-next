import {
  COLLECTION_NAME_MAX_LENGTH,
  COLLECTION_NAME_MIN_LENGTH,
  COLLECTION_NAME_NON_WHITESPACE_REGEX,
} from '@/components/Collection/collectionNameValidation';
import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

const getNewCollectionNameRules = (t: any, fieldName: string) => [
  {
    type: RuleType.Required,
    value: true,
    errorMessage: t('common:errors.required', { fieldName }),
  },
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
    value: COLLECTION_NAME_NON_WHITESPACE_REGEX,
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
