import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import ChevronRightIcon from '../../../../public/icons/chevron-right.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const ChapterControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const { chapterId } = lastVerse;
  const chapterNumber = Number(chapterId);

  return (
    <>
      {!isFirstSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getSurahNavigationUrl(chapterNumber - 1)}
          onClick={() => {
            logButtonClick('chapter_control_prev_chapter');
          }}
        >
          {t('prev-surah')}
        </Button>
      )}
      <Button
        type={ButtonType.Secondary}
        href={getSurahNavigationUrl(chapterNumber + 1)}
        onClick={() => {
          logButtonClick('chapter_control_scroll_to_beginning');
          scrollToTop();
        }}
      >
        {t('surah-beginning')}
      </Button>
      {!isLastSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getSurahNavigationUrl(chapterNumber + 1)}
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
