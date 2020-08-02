import React from 'react';
import styled from 'styled-components';
import VerseType from '../../../../types/VerseType';
import Line from './Line';
import groupLinesByVerses from './groupLinesByVerses';

type PageViewProps = {
  verses: VerseType[];
};

const PageView = ({ verses }: PageViewProps) => {
  const lines = groupLinesByVerses(verses);

  return (
    <StyledPageView>
      {Object.keys(lines).map((key) => (
        <Line words={lines[key]} key={key} />
      ))}
    </StyledPageView>
  );
};

const StyledPageView = styled.div`
  max-width: 100%;
  direction: rtl;
  margin: 1rem auto;
`;

export default PageView;
