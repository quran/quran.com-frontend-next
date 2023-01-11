import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType } from '@/dls/Button/Button';
import useScrollToTop from '@/hooks/useScrollToTop';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { isFirstHizb, isLastHizb } from '@/utils/hizb';
import { getHizbNavigationUrl } from '@/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const HizbControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const { hizbNumber } = lastVerse;

  return (
    <>
      {!isFirstHizb(hizbNumber) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getHizbNavigationUrl(hizbNumber - 1)}
          onClick={() => {
            logButtonClick('hizb_control_prev_hizb');
          }}
        >
          {t('prev-hizb')}
        </Button>
      )}
      <Button
        type={ButtonType.Secondary}
        onClick={() => {
          logButtonClick('hizb_control_scroll_to_beginning');
          scrollToTop();
        }}
      >
        {t('hizb-beginning')}
      </Button>

      {!isLastHizb(hizbNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getHizbNavigationUrl(hizbNumber + 1)}
          onClick={() => {
            logButtonClick('hizb_control_next_hizb');
          }}
        >
          {t('next-hizb')}
        </Button>
      )}
    </>
  );
};

export default HizbControls;
