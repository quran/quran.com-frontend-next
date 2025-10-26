import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfSurahSection from '../EndOfSurahSection';
import LearningPlanBanner from '../LearningPlanBanner';

import Language from '@/types/Language';
import { VersesResponse } from 'types/ApiResponses';

// Surah Al-Mulk
const LEARNING_PLAN_CHAPTER = 67;

interface Props {
  initialData: VersesResponse;
}

const ChapterControls: React.FC<Props> = ({ initialData }) => {
  const { lang } = useTranslation('quran-reader');
  const chapterIdAndLastVerse = initialData.pagesLookup.lookupRange.to;
  // example : "2:253" -> chapter 2 verse 253
  const chapterId = chapterIdAndLastVerse.split(':')[0];
  const chapterNumber = Number(chapterId);

  return (
    <>
      <EndOfSurahSection chapterNumber={chapterNumber} />

      {lang === Language.EN && chapterNumber === LEARNING_PLAN_CHAPTER && <LearningPlanBanner />}
    </>
  );
};

export default ChapterControls;
