import React, { memo, useMemo } from 'react';
import AvailableTranslation from 'types/AvailableTranslation';
import Combobox from '../dls/Forms/Combobox';
import styles from './Filter.module.scss';

interface Props {
  onTranslationChange: (translationId: string) => void;
  selectedTranslation: string;
  translations: AvailableTranslation[];
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ translations, selectedTranslation, onTranslationChange }) => {
    // we need to match the selectedTranslation because if it comes from the URL's query param and the user had entered an invalid languageCode in the url or if he didn't select a translation at all, we should set a different text
    const matchedTranslation = translations.find(
      (translation) => translation.id.toString() === selectedTranslation,
    );
    const initialInputValue = matchedTranslation ? matchedTranslation.translatedName.name : '';

    const translationsItems = useMemo(
      () =>
        translations.map((translation) => {
          const stringId = translation.id.toString();
          return {
            id: stringId,
            name: stringId,
            value: stringId,
            label: translation.translatedName.name,
          };
        }),
      [translations],
    );

    return (
      <Combobox
        id="translations"
        value={selectedTranslation || ''}
        items={translationsItems}
        onChange={onTranslationChange}
        initialInputValue={initialInputValue}
        placeholder="Select a translation"
        label={<div className={styles.dropdownLabel}>Translation</div>}
      />
    );
  },
);
export default TranslationsFilter;
