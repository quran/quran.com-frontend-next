import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstJuz, isLastJuz } from 'src/utils/juz';
import { getJuzNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const JuzControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const { juzNumber } = lastVerse;
  return (
    <>
      {!isFirstJuz(juzNumber) && (
        <EndOfScrollingButton text={t('prev-juz')} href={getJuzNavigationUrl(juzNumber - 1)} />
      )}
      <EndOfScrollingButton text={t('juz-beginning')} onClick={scrollToTop} />
      {!isLastJuz(juzNumber) && (
        <EndOfScrollingButton text={t('next-juz')} href={getJuzNavigationUrl(juzNumber + 1)} />
      )}
    </>
  );
};

export default JuzControls;
