import React, { useState, useEffect, memo, useMemo } from 'react';
import { getAvailableTranslations } from 'src/api';
import styled from 'styled-components';
import AvailableTranslation from 'types/AvailableTranslation';
import SearchDropdown from '../dls/Forms/SearchDropdown/SearchDropdown';

interface Props {
  onTranslationChange: (translationId: string) => void;
  selectedTranslation: string;
  lang: string;
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ lang, selectedTranslation, onTranslationChange }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [translations, setTranslations] = useState<AvailableTranslation[]>([]);

    useEffect(() => {
      setIsLoading(true);
      getAvailableTranslations(lang)
        .then((res) => {
          // if there is no error
          if (res.status !== 500) {
            setTranslations(res.translations);
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
      // we need to match the selectedTranslation because if it comes from the URL's query param and the user had entered an invalid languageCode in the url or if he didn't select a translation at all, we should set a different text
      const matchedTranslation = translations.find(
        (translation) => translation.id.toString() === selectedTranslation,
      );
      selectorText = matchedTranslation
        ? matchedTranslation.translatedName.name
        : 'Select a translation';
    }

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
      <SearchDropdown
        id="translations"
        selectedItem={selectedTranslation || ''}
        items={translationsItems}
        onSelect={onTranslationChange}
        selectorText={selectorText}
        label={<StyledDropdownLabel>Translation</StyledDropdownLabel>}
      />
    );
  },
);

const StyledDropdownLabel = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

export default TranslationsFilter;
