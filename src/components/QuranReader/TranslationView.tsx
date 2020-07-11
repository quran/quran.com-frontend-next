import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import VerseText from '../Verse/VerseText';
import Text from '../dls/Text/Text';
import { QuranFonts } from './types';

type TranslationViewProps = {
  verses: VerseType[];
};

const TranslationView = ({ verses }: TranslationViewProps) => {
  return (
    <StyledTranslationView>
      {verses.map((verse) => (
        <VerseTextContainer key={verse.id}>
          {/* TODO (@abdellatif): get the fonts from the user preferences */}
          <VerseText verse={verse} fontStyle={QuranFonts.Uthmani} />
          <StyledText>{verse.translations && verse.translations[0]?.text}</StyledText>
          <hr />
        </VerseTextContainer>
      ))}
    </StyledTranslationView>
  );
};

const VerseTextContainer = styled.div``;

const StyledTranslationView = styled.div`
  max-width: 100%;
  margin: 1rem auto;
`;

const StyledText = styled(Text)`
  letter-spacing: 0rem;
`;

export default TranslationView;
