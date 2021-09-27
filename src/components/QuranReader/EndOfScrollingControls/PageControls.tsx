import React from 'react';

import EndOfScrollingButton from './EndOfScrollingButton';

import { getPageNavigationUrl } from 'src/utils/navigation';
import { isFirstPage, isLastPage } from 'src/utils/page';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const PageControls: React.FC<Props> = ({ lastVerse }) => {
  const { pageNumber } = lastVerse;
  const page = Number(pageNumber);
  return (
    <>
      {!isFirstPage(page) && (
        <EndOfScrollingButton text="Previous Page" href={getPageNavigationUrl(page - 1)} />
      )}
      {!isLastPage(page) && (
        <EndOfScrollingButton text="Next Page" href={getPageNavigationUrl(page + 1)} />
      )}
    </>
  );
};

export default PageControls;
