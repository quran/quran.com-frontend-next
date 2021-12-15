import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NextIcon from '../../../../public/icons/east.svg';
import PrevIcon from '../../../../public/icons/west.svg';

import EndOfScrollingButton from './EndOfScrollingButton';
import styles from './TafsirControls.module.scss';

import {
  getVerseNavigationUrlByVerseKey,
  getVerseSelectedTafsirNavigationUrl,
  getVerseTafsirNavigationUrl,
} from 'src/utils/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
  isTafsirIdSetFromUrl: boolean;
}

const TafsirControls: React.FC<Props> = ({ lastVerse, isTafsirIdSetFromUrl: isSelectedTafsir }) => {
  const { t } = useTranslation('quran-reader');
  const tafsirId = lastVerse?.tafsirs?.[0]?.resourceId;
  // if the id in the url is a non-existent tafsir id.
  if (isSelectedTafsir && !tafsirId) {
    return <></>;
  }
  const { chapterId, verseNumber } = lastVerse;
  return (
    <div className={styles.container}>
      {!isFirstVerseOfSurah(verseNumber) && (
        <EndOfScrollingButton
          text={<PrevIcon />}
          href={
            isSelectedTafsir
              ? getVerseSelectedTafsirNavigationUrl(chapterId, verseNumber - 1, tafsirId)
              : getVerseTafsirNavigationUrl(chapterId, verseNumber - 1)
          }
        />
      )}
      <EndOfScrollingButton
        text={t('go-ayah')}
        href={getVerseNavigationUrlByVerseKey(`${chapterId}:${verseNumber}`)}
      />
      {!isLastVerseOfSurah(String(chapterId), verseNumber) && (
        <EndOfScrollingButton
          text={<NextIcon />}
          href={
            isSelectedTafsir
              ? getVerseSelectedTafsirNavigationUrl(chapterId, verseNumber + 1, tafsirId)
              : getVerseTafsirNavigationUrl(chapterId, verseNumber + 1)
          }
        />
      )}
    </div>
  );
};

export default TafsirControls;
