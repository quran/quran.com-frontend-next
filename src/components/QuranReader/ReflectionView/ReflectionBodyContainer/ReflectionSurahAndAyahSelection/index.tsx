import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionSurahAndAyahSelection.module.scss';

import SurahAndAyahSelection from '@/components/QuranReader/TafsirView/SurahAndAyahSelection';
import { logItemSelectionChange } from '@/utils/eventLogger';
import { fakeNavigate, getVerseReflectionNavigationUrl } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  setSelectedChapterId: (chapterId: string) => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
}

const ReflectionSurahAndAyahSelection: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  setSelectedVerseNumber,
  setSelectedChapterId,
}) => {
  const { lang } = useTranslation();
  const onChapterIdChange = (newChapterId) => {
    logItemSelectionChange('reflection_chapter_id', newChapterId);
    setSelectedChapterId(newChapterId.toString());
    const newVerseNumber = '1';
    setSelectedVerseNumber(newVerseNumber); // reset verse number to 1 every time chapter changes
    fakeNavigate(
      getVerseReflectionNavigationUrl(makeVerseKey(newChapterId, Number(newVerseNumber))),
      lang,
    );
  };

  const onVerseNumberChange = (newVerseNumber) => {
    logItemSelectionChange('reflection_verse_number', newVerseNumber);
    setSelectedVerseNumber(newVerseNumber.toString());
    fakeNavigate(
      getVerseReflectionNavigationUrl(
        makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
      ),
      lang,
    );
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
