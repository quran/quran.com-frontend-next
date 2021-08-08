import React, { memo, useMemo } from 'react';
import AvailableLanguage from 'types/AvailableLanguage';
import SearchDropdown from '../dls/Forms/SearchDropdown/SearchDropdown';
import styles from './Filter.module.scss';

interface Props {
  onLanguageChange: (languageIsoCode: string) => void;
  selectedLanguage: string;
  languages: AvailableLanguage[];
}

const LanguagesFilter: React.FC<Props> = memo(
  ({ languages, selectedLanguage, onLanguageChange }) => {
    // we need to match the selectedLanguage because if it comes from the URL's query param and the user had entered an invalid languageCode in the url, we should set a different text
    const matchedLanguage = languages.find((language) => language.isoCode === selectedLanguage);
    const selectorText = matchedLanguage
      ? matchedLanguage.translatedName.name
      : 'Select a language';

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
      <SearchDropdown
        id="languages"
        selectedItem={selectedLanguage}
        items={languagesItems}
        onSelect={onLanguageChange}
        selectorText={selectorText}
        label={<div className={styles.dropdownLabel}>Language</div>}
      />
    );
  },
);

export default LanguagesFilter;
