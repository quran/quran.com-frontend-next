import React, { useState, useEffect, memo, useMemo } from 'react';
import { getAvailableLanguages } from 'src/api';
import styled from 'styled-components';
import AvailableLanguage from 'types/AvailableLanguage';
import SearchDropdown from '../dls/Forms/SearchDropdown/SearchDropdown';

interface Props {
  onLanguageChange: (languageIsoCode: string) => void;
  selectedLanguage: string;
  lang: string;
}

const LanguagesFilter: React.FC<Props> = memo(({ lang, selectedLanguage, onLanguageChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [languages, setLanguages] = useState<AvailableLanguage[]>([]);

  useEffect(() => {
    setIsLoading(true);
    getAvailableLanguages(lang)
      .then((res) => {
        // if there is no error
        if (res.status !== 500) {
          setLanguages(res.languages);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lang]);

  let selectorText = '';
  if (isLoading) {
    selectorText = 'Loading...';
  } else {
    // we need to match the selectedLanguage because if it comes from the URL's query param and the user had entered an invalid languageCode in the url, we should set a different text
    const matchedLanguage = languages.find((language) => language.isoCode === selectedLanguage);
    selectorText = matchedLanguage ? matchedLanguage.translatedName.name : 'Select a language';
  }

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
});

const StyledDropdownLabel = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

export default LanguagesFilter;
