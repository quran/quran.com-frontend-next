import React, { useMemo } from 'react';
import styled from 'styled-components';
import Verse from '../../../../types/VerseType';
import Page from './Page';
import groupPagesByVerses from './groupPagesByVerses';

type PageViewProps = {
  verses: Verse[];
};

const PageView = ({ verses }: PageViewProps) => {
  const pages = useMemo(() => groupPagesByVerses(verses), [verses]);

  return (
    <StyledPageView>
      {Object.keys(pages).map((pageNumber) => (
        <Page verses={pages[pageNumber]} key={`page-${pageNumber}`} page={Number(pageNumber)} />
      ))}
    </StyledPageView>
  );
};

const StyledPageView = styled.div`
  max-width: 100%;
  direction: rtl;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
`;

export default React.memo(PageView);
