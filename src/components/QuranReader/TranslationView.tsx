import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import VerseText from '../Verse/VerseText';

type TranslationViewProps = {
  verses: VerseType[];
};

const TranslationView = ({ verses }: TranslationViewProps) => {
  return (
    <StyledTranslationView>
      {verses.map((verse) => (
        <VerseTextContainer key={verse.id}>
          <VerseText verse={verse} fontStyle="uthmani" />
        </VerseTextContainer>
      ))}
    </StyledTranslationView>
  );
};

const VerseTextContainer = styled.div`
  font-size: 2rem; //TODO (@abdellatif): update to use the theme font size
  line-height: 3rem; //TODO (@abdellatif): update to use the theme font size
  letter-spacing: 0.25rem; //TODO (@abdellatif): update to use the theme font size
`;

const StyledTranslationView = styled.div`
  max-width: 100%;
  direction: rtl;
  margin: 1rem;
`;

export default TranslationView;
