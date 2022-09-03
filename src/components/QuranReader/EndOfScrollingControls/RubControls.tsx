import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import ChevronRightIcon from '../../../../public/icons/chevron-right.svg';

import Button, { ButtonType } from '@/dls/Button/Button';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { logButtonClick } from '@/utils/eventLogger';
import { getRubNavigationUrl } from '@/utils/navigation';
import { isFirstRub, isLastRub } from '@/utils/rub';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const RubControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const { rubElHizbNumber } = lastVerse;
  return (
    <>
      {!isFirstRub(rubElHizbNumber) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getRubNavigationUrl(rubElHizbNumber - 1)}
          onClick={() => {
            logButtonClick('rub_control_prev_rub');
          }}
        >
          {t('prev-rub')}
        </Button>
      )}
      <Button
        type={ButtonType.Secondary}
        href={getRubNavigationUrl(rubElHizbNumber - 1)}
        onClick={() => {
          logButtonClick('rub_control_scroll_to_beginning');
          scrollToTop();
        }}
      >
        {t('rub-beginning')}
      </Button>

      {!isLastRub(rubElHizbNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getRubNavigationUrl(rubElHizbNumber + 1)}
          onClick={() => {
            logButtonClick('rub_control_next_rub');
          }}
        >
          {t('next-rub')}
        </Button>
      )}
    </>
  );
};

export default RubControls;
