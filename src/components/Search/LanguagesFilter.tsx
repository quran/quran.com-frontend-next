import React, { memo, useMemo } from 'react';
import AvailableLanguage from 'types/AvailableLanguage';
import Combobox from '../dls/Forms/Combobox';
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
    const initialInputValue = matchedLanguage ? matchedLanguage.translatedName.name : '';

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
        id="languages"
        value={selectedLanguage}
        items={languagesItems}
        onChange={onLanguageChange}
        initialInputValue={initialInputValue}
        placeholder="Select a language"
        label={<div className={styles.dropdownLabel}>Language</div>}
      />
    );
  },
);

export default LanguagesFilter;
