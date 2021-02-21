import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../../types/VerseType';
import VerseText from '../../Verse/VerseText';

type TranslationViewProps = {
  verses: VerseType[];
};

const TranslationView = ({ verses }: TranslationViewProps) => {
  return (
    <StyledTranslationView>
      {verses.map((verse) => (
        <VerseTextContainer highlight={false} key={verse.id}>
          <VerseText words={verse.words} />
          <StyledText>{verse.translations && verse.translations[0]?.text}</StyledText>
          <hr />
        </VerseTextContainer>
      ))}
    </StyledTranslationView>
  );
};

const VerseTextContainer = styled.div<{ highlight: boolean }>`
  background: ${({ highlight, theme }) => highlight && theme.colors.primary.medium};
`;

const StyledTranslationView = styled.div`
  max-width: 100%;
  margin: ${(props) => props.theme.spacing.medium} auto;
`;

const StyledText = styled.span`
  letter-spacing: 0;
`;

export default TranslationView;
