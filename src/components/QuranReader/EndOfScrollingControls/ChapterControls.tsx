import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import Button, { ButtonType } from '@/dls/Button/Button';
import useScrollToTop from '@/hooks/useScrollToTop';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { isFirstSurah, isLastSurah } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getNextSurahNavigationUrl, getPreviousSurahNavigationUrl } from '@/utils/navigation';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  initialData: VersesResponse;
}

const ChapterControls: React.FC<Props> = ({ initialData }) => {
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const chapterIdAndLastVerse = initialData.pagesLookup.lookupRange.to;
  // example : "2:253" -> chapter 2 verse 253
  const chapterId = chapterIdAndLastVerse.split(':')[0];
  const chapterNumber = Number(chapterId);

  return (
    <>
      {!isFirstSurah(chapterNumber, isReadingByRevelationOrder) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getPreviousSurahNavigationUrl(chapterNumber, isReadingByRevelationOrder)}
          onClick={() => {
            logButtonClick('chapter_control_prev_chapter');
          }}
        >
          {t('prev-surah')}
        </Button>
      )}
      <Button
        type={ButtonType.Secondary}
        onClick={() => {
          logButtonClick('chapter_control_scroll_to_beginning');
          scrollToTop();
        }}
      >
        {t('surah-beginning')}
      </Button>
      {!isLastSurah(chapterNumber, isReadingByRevelationOrder) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getNextSurahNavigationUrl(chapterNumber, isReadingByRevelationOrder)}
          onClick={() => {
            logButtonClick('chapter_control_next_chapter');
          }}
        >
          {t('next-surah')}
        </Button>
      )}
    </>
  );
};

export default ChapterControls;
