import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import ChevronRightIcon from '../../../../public/icons/chevron-right.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl, getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const VerseControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const { chapterId, verseNumber, verseKey } = lastVerse;
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = isLastVerse(chaptersData, String(chapterId), verseNumber);
  return (
    <>
      {isLastVerseOfSurah && !isFirstSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getSurahNavigationUrl(chapterNumber - 1)}
          onClick={() => {
            logButtonClick('verse_control_prev_chapter');
          }}
        >
          {t('prev-surah')}
        </Button>
      )}
      {!isLastVerseOfSurah && (
        <>
          <Button
            type={ButtonType.Secondary}
            href={getSurahNavigationUrl(chapterNumber)}
            onClick={() => {
              logButtonClick('verse_control_full_chapter');
            }}
          >
            {t('full-surah-cta')}
          </Button>
          <Button
            href={getChapterWithStartingVerseUrl(verseKey)}
            onClick={() => {
              logButtonClick('verse_control_continue');
            }}
          >
            {t('common:continue')}
          </Button>
        </>
      )}
      {isLastVerseOfSurah && (
        <Button
          type={ButtonType.Secondary}
          href={getSurahNavigationUrl(chapterNumber)}
          onClick={() => {
            logButtonClick('verse_control_chapter_beginning');
          }}
        >
          {t('surah-beginning')}
        </Button>
      )}
      {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getSurahNavigationUrl(chapterNumber + 1)}
          onClick={() => {
            logButtonClick('verse_control_next_chapter');
          }}
        >
          {t('next-surah')}
        </Button>
      )}
    </>
  );
};

export default VerseControls;
