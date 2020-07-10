import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../types/VerseType';
import VerseText from '../Verse/VerseText';

type MushafViewProps = {
  verses: VerseType[];
};

const MushafView = ({ verses }: MushafViewProps) => {
  return (
    <StyledMushafView>
      {verses.map((verse) => (
        <VerseText verse={verse} fontStyle="uthmani" key={verse.id} />
      ))}
    </StyledMushafView>
  );
};

const StyledMushafView = styled.div`
  font-size: 2rem; //TODO (@abdellatif): update to use the theme font size
  line-height: 3rem; //TODO (@abdellatif): update to use the theme font size
  letter-spacing: 0.25rem; //TODO (@abdellatif): update to use the theme font size
  max-width: 100%;
  direction: rtl;
  margin: 1rem;
`;

export default MushafView;
