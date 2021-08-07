import React, { memo, useMemo } from 'react';
import styled from 'styled-components';
import AvailableLanguage from 'types/AvailableLanguage';
import SearchDropdown from '../dls/Forms/SearchDropdown/SearchDropdown';

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
        label={<StyledDropdownLabel>Language</StyledDropdownLabel>}
      />
    );
  },
);

const StyledDropdownLabel = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

export default LanguagesFilter;
