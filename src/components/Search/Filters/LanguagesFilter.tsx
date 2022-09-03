import React, { memo, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Filter.module.scss';

import Combobox from '@/dls/Forms/Combobox';
import AvailableLanguage from 'types/AvailableLanguage';

interface Props {
  onLanguageChange: (languageIsoCode: string[]) => void;
  selectedLanguages: string;
  languages: AvailableLanguage[];
}

const LanguagesFilter: React.FC<Props> = memo(
  ({ languages, selectedLanguages, onLanguageChange }) => {
    const { t } = useTranslation('search');
    /*
      We need to only pick the languages that exist in the list of available languages
      to avoid selecting non-existent items since the languages can come from the URL path
      which the user can edit to enter invalid values.
    */
    const matchedLanguages = languages
      .filter((language) => selectedLanguages.split(',').includes(language.isoCode))
      .map((language) => language.isoCode);

    const languagesItems = useMemo(
      () =>
        languages.map((language) => ({
          id: `${language.id}`,
          name: language.isoCode,
          value: language.isoCode,
          label: language.translatedName.name,
        })),
      [languages],
    );

    return (
      <div className={styles.comboboxItems}>
        <Combobox
          isMultiSelect
          id="languagesFilter"
          value={matchedLanguages}
          items={languagesItems}
          onChange={onLanguageChange}
          placeholder={t('language-select')}
        />
      </div>
    );
  },
);

export default LanguagesFilter;
