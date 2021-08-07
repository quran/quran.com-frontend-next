/* eslint-disable react/no-danger */
import React from 'react';
import styled from 'styled-components';
import SearchResult from 'types/SearchResult';

interface Props {
  result: SearchResult;
}

const SearchResultItem: React.FC<Props> = ({ result }) => {
  return (
    <ItemContainer>
      <QuranTextContainer>
        <div>VerseKey</div>
        <QuranTextResult dangerouslySetInnerHTML={{ __html: result.text }} />
      </QuranTextContainer>
      {result.translations.map((translation) => (
        <TranslationContainer key={translation.id}>
          <div dangerouslySetInnerHTML={{ __html: translation.text }} />
          <TranslationName>{translation.name}</TranslationName>
        </TranslationContainer>
      ))}
    </ItemContainer>
  );
};

const TranslationName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.normal};
  color: ${({ theme }) => theme.colors.text.default};
`;

const TranslationContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.small} 0;
`;

const QuranTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const QuranTextResult = styled.div`
  line-height: ${(props) => props.theme.lineHeights.large};
  direction: rtl;
`;

const ItemContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borders.hairline};
  border-radius: ${(props) => props.theme.borderRadiuses.default};
  background-color: ${(props) => props.theme.colors.background.neutralGrey};
  padding: ${(props) => props.theme.spacing.small};
  margin-top: ${(props) => props.theme.spacing.xsmall};
  margin-bottom: ${(props) => props.theme.spacing.xsmall};
`;

export default SearchResultItem;
