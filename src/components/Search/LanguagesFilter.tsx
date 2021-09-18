import React, { memo, useMemo } from 'react';

import styles from './Filter.module.scss';

import Combobox from 'src/components/dls/Forms/Combobox';
import AvailableLanguage from 'types/AvailableLanguage';

interface Props {
  onLanguageChange: (languageIsoCode: string[]) => void;
  selectedLanguages: string;
  languages: AvailableLanguage[];
}

const LanguagesFilter: React.FC<Props> = memo(
  ({ languages, selectedLanguages, onLanguageChange }) => {
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
      <Combobox
        isMultiSelect
        id="languagesFilter"
        value={matchedLanguages}
        minimumRequiredItems={1}
        items={languagesItems}
        onChange={onLanguageChange}
        placeholder="Select a language"
        label={<div className={styles.dropdownLabel}>Language</div>}
      />
    );
  },
);

export default LanguagesFilter;
