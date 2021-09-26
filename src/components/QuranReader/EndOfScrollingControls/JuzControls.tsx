import React from 'react';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstJuz, isLastJuz } from 'src/utils/juz';
import { getJuzNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const JuzControls: React.FC<Props> = ({ lastVerse }) => {
  const scrollToTop = useScrollToTop();
  const { juzNumber } = lastVerse;
  return (
    <>
      {!isFirstJuz(juzNumber) && (
        <EndOfScrollingButton text="Previous Juz" href={getJuzNavigationUrl(juzNumber - 1)} />
      )}
      <EndOfScrollingButton text="Beginning of Juz" onClick={scrollToTop} />
      {!isLastJuz(juzNumber) && (
        <EndOfScrollingButton text="Next Juz" href={getJuzNavigationUrl(juzNumber + 1)} />
      )}
    </>
  );
};

export default JuzControls;
