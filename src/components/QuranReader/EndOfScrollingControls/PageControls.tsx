import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import ChevronRightIcon from '../../../../public/icons/chevron-right.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { logButtonClick } from 'src/utils/eventLogger';
import { getPageNavigationUrl } from 'src/utils/navigation';
import { isFirstPage, isLastPage } from 'src/utils/page';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const PageControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  /**
   * We need to access the last word of the the last verse instead
   * since the pageNumber of the last verse in the case of the 16-line
   * Mushaf can point to the next page instead of the current one when
   * the verse spans across 2 pages e.g. /ur/page/30 (verse 16).
   */
  const { pageNumber } = lastVerse.words[lastVerse.words.length - 1];
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles);
  const page = Number(pageNumber);
  return (
    <>
      {!isFirstPage(page) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getPageNavigationUrl(page - 1)}
          onClick={() => {
            logButtonClick('page_control_prev_page');
          }}
        >
          {t('prev-page')}
        </Button>
      )}
      {!isLastPage(page, quranFont, mushafLines) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getPageNavigationUrl(page + 1)}
          onClick={() => {
            logButtonClick('page_control_next_page');
          }}
        >
          {t('next-page')}
        </Button>
      )}
    </>
  );
};

export default PageControls;
