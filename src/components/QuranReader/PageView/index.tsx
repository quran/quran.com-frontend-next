import React, { useMemo } from 'react';
import styled from 'styled-components';
import VerseType from '../../../../types/VerseType';
import Page from './Page';
import groupPagesByVerses from './groupPagesByVerses';

type PageViewProps = {
  verses: VerseType[];
};

const PageView = ({ verses }: PageViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <StyledPageView>
      {Object.keys(pages).map((key) => (
        <Page verses={pages[key]} key={key} />
      ))}
    </StyledPageView>
  );
};

const StyledPageView = styled.div`
  max-width: 100%;
  direction: rtl;
`;

export default React.memo(PageView);
