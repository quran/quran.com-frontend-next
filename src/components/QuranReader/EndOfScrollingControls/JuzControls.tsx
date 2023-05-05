import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType } from '@/dls/Button/Button';
import useScrollToTop from '@/hooks/useScrollToTop';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { isFirstJuz, isLastJuz } from '@/utils/juz';
import { getJuzNavigationUrl } from '@/utils/navigation';
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
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getJuzNavigationUrl(juzNumber - 1)}
          onClick={() => {
            logButtonClick('juz_control_prev_juz');
          }}
        >
          {t('prev-juz')}
        </Button>
      )}
      <Button
        type={ButtonType.Secondary}
        onClick={() => {
          logButtonClick('juz_control_scroll_to_beginning');
          scrollToTop();
        }}
      >
        {t('juz-beginning')}
      </Button>

      {!isLastJuz(juzNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getJuzNavigationUrl(juzNumber + 1)}
          onClick={() => {
            logButtonClick('juz_control_next_juz');
          }}
        >
          {t('next-juz')}
        </Button>
      )}
    </>
  );
};

export default JuzControls;
