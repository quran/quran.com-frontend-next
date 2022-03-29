import React, { memo, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Filter.module.scss';

import Combobox from 'src/components/dls/Forms/Combobox';
import { getTranslatedLabelWithLanguage } from 'src/utils/input';
import AvailableTranslation from 'types/AvailableTranslation';

interface Props {
  onTranslationChange: (translationId: string[]) => void;
  selectedTranslations: string;
  translations: AvailableTranslation[];
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ translations, selectedTranslations, onTranslationChange }) => {
    const { t } = useTranslation('search');
    /*
      We need to only pick the translations that exist in the list of available translations
      to avoid selecting non-existent items since the translations can come from the URL path
      which the user can edit to enter invalid values.
    */
    const matchedTranslations = selectedTranslations
      ? translations
          .filter((translation) =>
            selectedTranslations.split(',').includes(translation.id.toString()),
          )
          .map((translation) => translation.id.toString())
      : [];

    const translationsItems = useMemo(
      () =>
        translations.map((translation) => {
          const stringId = translation.id.toString();
          return {
            id: stringId,
            name: stringId,
            value: stringId,
            label: getTranslatedLabelWithLanguage(translation),
          };
        }),
      [translations],
    );

    return (
      <div className={styles.comboboxItems}>
        <Combobox
          fixedWidth={false}
          isMultiSelect
          id="translationsFilter"
          value={matchedTranslations}
          items={translationsItems}
          onChange={onTranslationChange}
          placeholder={t('translation-select')}
        />
      </div>
    );
  },
);
export default TranslationsFilter;
