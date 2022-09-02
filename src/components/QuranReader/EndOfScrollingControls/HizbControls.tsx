import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import ChevronRightIcon from '../../../../public/icons/chevron-right.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { logButtonClick } from 'src/utils/eventLogger';
import { isFirstHizb, isLastHizb } from 'src/utils/hizb';
import { getHizbNavigationUrl } from 'src/utils/navigation';
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
        href={getHizbNavigationUrl(hizbNumber)}
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
