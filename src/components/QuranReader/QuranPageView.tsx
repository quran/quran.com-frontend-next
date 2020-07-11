import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import VerseText from '../Verse/VerseText';
import { QuranFonts } from './types';

type QuranPageViewProps = {
  verses: VerseType[];
};

const QuranPageView = ({ verses }: QuranPageViewProps) => {
  return (
    <StyledQuranPageView>
      {verses.map((verse) => (
        // TODO (@abdellatif): read the font from the user prefernces
        <VerseText verse={verse} fontStyle={QuranFonts.Uthmani} key={verse.id} />
      ))}
    </StyledQuranPageView>
  );
};

const StyledQuranPageView = styled.div`
  max-width: 100%;
  direction: rtl;
  margin: 1rem auto;
`;

export default QuranPageView;
