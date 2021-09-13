import React from 'react';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { getChapterDataById } from 'src/utils/chapter';
import { VersesResponse } from 'types/APIResponses';
import { QuranReaderDataType } from '../types';
import styles from './ControlButtons.module.scss';

interface Props {
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
}

const ControlButtons: React.FC<Props> = ({ quranReaderDataType, initialData }) => {
  const isVerse = quranReaderDataType === QuranReaderDataType.Verse;
  // only show the controls for the verse for now.
  if (!isVerse) {
    return <></>;
  }
  const { chapterId, verseNumber } = initialData.verses[0];
  const { versesCount } = getChapterDataById(String(chapterId));
  const chapterNumber = Number(chapterId);
  const isFirstSurah = chapterNumber === 1;
  const isLastSurah = chapterNumber === 114;
  const isLastVerseOfSurah = verseNumber === versesCount;

  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        {isLastVerseOfSurah && !isFirstSurah && (
          <Button type={ButtonType.Secondary} href={`/${chapterNumber - 1}`}>
            Previous Surah
          </Button>
        )}
        {!isLastVerseOfSurah && (
          <>
            <Button type={ButtonType.Secondary} href={`/${chapterId}`}>
              Read full surah
            </Button>
            <Button
              type={ButtonType.Secondary}
              href={`/${chapterNumber}/${verseNumber}-${versesCount}`}
            >
              Continue
            </Button>
          </>
        )}
        {isLastVerseOfSurah && (
          <Button type={ButtonType.Secondary} href={`/${chapterId}`}>
            Beginning of Surah
          </Button>
        )}
        {isLastVerseOfSurah && !isLastSurah && (
          <Button type={ButtonType.Secondary} href={`/${chapterNumber + 1}`}>
            Next Surah
          </Button>
        )}
      </div>
    </div>
  );
};

export default ControlButtons;
