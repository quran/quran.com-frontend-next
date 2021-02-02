import React, { useMemo } from 'react';
import styled from 'styled-components';
import VerseType from '../../../../types/VerseType';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';

type PageProps = {
  verses: VerseType[];
};

const Page = ({ verses }: PageProps) => {
  const lines = useMemo(() => groupLinesByVerses(verses), [verses]);

  return (
    <StyledPage>
      {Object.keys(lines).map((key) => (
        <Line words={lines[key]} key={key} />
      ))}
    </StyledPage>
  );
};

const StyledPage = styled.div`
  margin: 0 auto;
`;

export default React.memo(Page);
