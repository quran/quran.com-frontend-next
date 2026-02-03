import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfSurahSection from '../EndOfSurahSection';
import LearningPlanBanner from '../LearningPlanBanner';
import { getLearningPlanBannerConfig } from '../LearningPlanBanner/learningPlanBannerConfigs';

import Language from '@/types/Language';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  initialData: VersesResponse;
}

const ChapterControls: React.FC<Props> = ({ initialData }) => {
  const { lang } = useTranslation('quran-reader');
  const language = lang as Language;
  const chapterIdAndLastVerse = initialData.pagesLookup.lookupRange.to;
  // example : "2:253" -> chapter 2 verse 253
  const chapterId = chapterIdAndLastVerse.split(':')[0];
  const chapterNumber = Number(chapterId);

  const bannerConfig = getLearningPlanBannerConfig(language, chapterNumber);

  return (
    <>
      <EndOfSurahSection chapterNumber={chapterNumber} />
      {bannerConfig && <LearningPlanBanner language={language} chapterId={chapterNumber} />}
    </>
  );
};

export default ChapterControls;
