import React, { useContext } from 'react';

import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';

interface SurahInfoModalProps {
  chapterId: string;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ chapterId }) => {
  const chaptersData = useContext(DataContext);
  const chapter = getChapterData(chaptersData, chapterId);

  if (!chapter) return null;

  // Just render SurahInfoContent - let it handle all the fetching
  return <SurahInfoContent chapterId={chapterId} chapter={chapter} />;
};

export default SurahInfoModal;
