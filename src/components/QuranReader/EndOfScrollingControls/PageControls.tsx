import React from 'react';

import { useSelector } from 'react-redux';

import EndOfScrollingButton from './EndOfScrollingButton';

import { selectQuranFont } from 'src/redux/slices/QuranReader/styles';
import { getPageNavigationUrl } from 'src/utils/navigation';
import { isFirstPage, isLastPage } from 'src/utils/page';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const PageControls: React.FC<Props> = ({ lastVerse }) => {
  const { pageNumber } = lastVerse;
  const quranFont = useSelector(selectQuranFont);
  const page = Number(pageNumber);
  return (
    <>
      {!isFirstPage(page) && (
        <EndOfScrollingButton text="Previous Page" href={getPageNavigationUrl(page - 1)} />
      )}
      {!isLastPage(page, quranFont) && (
        <EndOfScrollingButton text="Next Page" href={getPageNavigationUrl(page + 1)} />
      )}
    </>
  );
};

export default PageControls;
