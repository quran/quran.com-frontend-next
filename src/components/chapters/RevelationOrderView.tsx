import { useMemo } from 'react';

import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './ChapterAndJuzList.module.scss';

import { setIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import Chapter from '@/types/Chapter';
import { QURAN_CHAPTERS_COUNT } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import REVELATION_ORDER from '@/utils/revelationOrder';

const MECCAN_SURAH_STRING_IDENTIFIER = 'makkah'; // the value is coming from the backend, ideally we would've set it up as an enum, but other pieces of the code are relying on this as a string, so we'll keep it as a string for now.
type RevelationOrderViewProps = {
  isDescending: boolean;
  chapters: Chapter[];
};

const RevelationOrderView = ({ isDescending, chapters }: RevelationOrderViewProps) => {
  const { t, lang } = useTranslation();
  const dispatch = useDispatch();

  // When the user clicks on a surah through the revelation order list, put them in "revelation order" mode.
  const onSurahClick = () => {
    dispatch({ type: setIsReadingByRevelationOrder.type, payload: true });
    logEvent('revelation_ordering_surah_click');
  };

  const sortedChaptersByRevelationOrder = useMemo(
    () =>
      isDescending
        ? chapters
            .slice()
            .sort(
              (a, b) =>
                REVELATION_ORDER.indexOf(Number(b.id)) - REVELATION_ORDER.indexOf(Number(a.id)),
            )
        : chapters
            .slice()
            .sort(
              (a, b) =>
                REVELATION_ORDER.indexOf(Number(a.id)) - REVELATION_ORDER.indexOf(Number(b.id)),
            ),
    [isDescending, chapters],
  );

  return (
    <>
      {sortedChaptersByRevelationOrder.map((chapter, revelationOrderIndex) => (
        <div className={styles.chapterContainer} key={chapter.id}>
          <Link href={`/${chapter.id}`} shouldPrefetch={false} onClick={onSurahClick}>
            <SurahPreviewRow
              chapterId={REVELATION_ORDER[revelationOrderIndex]}
              description={getChapterDescription(chapter, t)}
              surahName={`${chapter.transliteratedName}`}
              surahNumber={
                isDescending
                  ? QURAN_CHAPTERS_COUNT - Number(revelationOrderIndex)
                  : Number(revelationOrderIndex + 1)
              } // Show the number based on the revelation order instead of the surah number.
              translatedSurahName={getTranslatedSurahName(chapter, t, lang)}
              isMinimalLayout={false}
            />
          </Link>
        </div>
      ))}
    </>
  );
};

const getChapterDescription = (chapter: Chapter, t: Translate) => {
  if (chapter.revelationPlace === MECCAN_SURAH_STRING_IDENTIFIER) {
    return t('common:meccan');
  }

  return t('common:medinan');
};

const getTranslatedSurahName = (chapter: Chapter, t: Translate, lang: string) => {
  if (shouldUseMinimalLayout(lang)) {
    return `${t('common:surah')} ${toLocalizedNumber(chapter.id, lang)}`;
  }
  return `${toLocalizedNumber(Number(chapter.id), lang)}: ${chapter.translatedName as string}`;
};

export default RevelationOrderView;
