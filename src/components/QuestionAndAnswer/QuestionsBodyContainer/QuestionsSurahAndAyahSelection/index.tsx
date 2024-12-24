import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer/ReflectionSurahAndAyahSelection/ReflectionSurahAndAyahSelection.module.scss';
import SurahAndAyahSelection from '@/components/QuranReader/TafsirView/SurahAndAyahSelection';
import { logItemSelectionChange } from '@/utils/eventLogger';
import { fakeNavigate, getVerseQuestionsNavigationUrl } from '@/utils/navigation';
import { makeVerseKey } from '@/utils/verse';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  setSelectedChapterId: (chapterId: string) => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
}

const QuestionsSurahAndAyahSelection: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  setSelectedVerseNumber,
  setSelectedChapterId,
}) => {
  const { lang } = useTranslation();
  const onChapterIdChange = (newChapterId) => {
    logItemSelectionChange('question_chapter_id', newChapterId);
    setSelectedChapterId(newChapterId.toString());
    const newVerseNumber = '1';
    setSelectedVerseNumber(newVerseNumber); // reset verse number to 1 every time chapter changes
    fakeNavigate(
      getVerseQuestionsNavigationUrl(makeVerseKey(newChapterId, Number(newVerseNumber))),
      lang,
    );
  };

  const onVerseNumberChange = (newVerseNumber) => {
    logItemSelectionChange('question_verse_number', newVerseNumber);
    setSelectedVerseNumber(newVerseNumber.toString());
    fakeNavigate(
      getVerseQuestionsNavigationUrl(
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

export default QuestionsSurahAndAyahSelection;
