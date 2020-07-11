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
  max-width: 100%;
  direction: rtl;
  margin: 1rem auto;
`;

export default MushafView;
