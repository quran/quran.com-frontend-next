import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionSurahAndAyahSelection.module.scss';

import SurahAndAyahSelection from '@/components/QuranReader/TafsirView/SurahAndAyahSelection';
import { logItemSelectionChange } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';
import ContentType from 'types/QuranReflect/ContentType';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  setSelectedChapterId: (chapterId: string) => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
  selectedContentType: ContentType;
}

const ReflectionSurahAndAyahSelection: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  setSelectedVerseNumber,
  setSelectedChapterId,
  selectedContentType,
}) => {
  const { lang } = useTranslation();

  const getNavigationUrl = (verseKey: string) => {
    return selectedContentType === ContentType.REFLECTIONS
      ? getVerseReflectionNavigationUrl(verseKey)
      : getVerseLessonNavigationUrl(verseKey);
  };

  const onChapterIdChange = (newChapterId) => {
    logItemSelectionChange('reflection_chapter_id', newChapterId);
    setSelectedChapterId(newChapterId.toString());
    const newVerseNumber = '1';
    setSelectedVerseNumber(newVerseNumber); // reset verse number to 1 every time chapter changes
    const verseKey = makeVerseKey(newChapterId, Number(newVerseNumber));
    fakeNavigate(getNavigationUrl(verseKey), lang);
  };

  const onVerseNumberChange = (newVerseNumber) => {
    logItemSelectionChange('reflection_verse_number', newVerseNumber);
    setSelectedVerseNumber(newVerseNumber.toString());
    const verseKey = makeVerseKey(Number(selectedChapterId), Number(newVerseNumber));
    fakeNavigate(getNavigationUrl(verseKey), lang);
  };

  return (
    <div className={styles.surahSelectionContainer}>
      <SurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        onChapterIdChange={onChapterIdChange}
        onVerseNumberChange={onVerseNumberChange}
      />
    </div>
  );
};

export default ReflectionSurahAndAyahSelection;
