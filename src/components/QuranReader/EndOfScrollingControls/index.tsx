import React from 'react';

import styles from './EndOfScrollingControls.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { QuranReaderDataType } from 'src/components/QuranReader/types';
import { getChapterData, isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
}

const EndOfScrollingControls: React.FC<Props> = ({ quranReaderDataType, initialData }) => {
  const isVerse = quranReaderDataType === QuranReaderDataType.Verse;
  // only show the controls for the verse for now.
  if (!isVerse) {
    return <></>;
  }
  const [firstVerse] = initialData.verses;
  const { chapterId, verseNumber } = firstVerse;
  const { versesCount } = getChapterData(String(chapterId));
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = verseNumber === versesCount;

  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        {isLastVerseOfSurah && !isFirstSurah(chapterNumber) && (
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
        {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
          <Button type={ButtonType.Secondary} href={`/${chapterNumber + 1}`}>
            Next Surah
          </Button>
        )}
      </div>
    </div>
  );
};

export default EndOfScrollingControls;
