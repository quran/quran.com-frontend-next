import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { logButtonClick } from 'src/utils/eventLogger';
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
        <EndOfScrollingButton
          text={t('prev-juz')}
          href={getJuzNavigationUrl(juzNumber - 1)}
          onClick={() => {
            logButtonClick('juz_control_prev_juz');
          }}
        />
      )}
      <EndOfScrollingButton
        text={t('juz-beginning')}
        onClick={() => {
          logButtonClick('juz_control_scroll_to_beginning');
          scrollToTop();
        }}
      />
      {!isLastJuz(juzNumber) && (
        <EndOfScrollingButton
          text={t('next-juz')}
          href={getJuzNavigationUrl(juzNumber + 1)}
          onClick={() => {
            logButtonClick('juz_control_next_juz');
          }}
        />
      )}
    </>
  );
};

export default JuzControls;
