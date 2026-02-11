import { FormBuilderFormField } from '@/components/FormBuilder/FormBuilderTypes';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';

const COLLECTION_NAME_MIN_LENGTH = 1;
const COLLECTION_NAME_MAX_LENGTH = 255;

const getNewCollectionNameFormFields = (t: any): FormBuilderFormField[] => [
  {
    field: 'name',
    placeholder: t('quran-reader:new-collection-name'),
    rules: [
      { type: RuleType.Required, value: true, errorMessage: 'Required' },
      {
        type: RuleType.MinimumLength,
        value: COLLECTION_NAME_MIN_LENGTH,
        errorMessage: t('common:errors.min', {
          fieldName: t('collection:collection-name'),
          min: COLLECTION_NAME_MIN_LENGTH,
        }),
      },
      {
        type: RuleType.MaximumLength,
        value: COLLECTION_NAME_MAX_LENGTH,
        errorMessage: t('common:errors.max', {
          fieldName: t('collection:collection-name'),
          max: COLLECTION_NAME_MAX_LENGTH,
        }),
      },
    ],
    type: FormFieldType.Text,
  },
];

export default getNewCollectionNameFormFields;
