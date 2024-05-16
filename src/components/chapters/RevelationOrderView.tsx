/* eslint-disable jsx-a11y/control-has-associated-label */
import { useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import styles from './ChapterAndJuzList.module.scss';

import SurahPreviewRow from '@/dls/SurahPreview/SurahPreviewRow';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { setIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import Chapter from '@/types/Chapter';
import { isLoggedIn } from '@/utils/auth/login';
import { QURAN_CHAPTERS_COUNT } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';
import REVELATION_ORDER from '@/utils/revelationOrder';

const MECCAN_SURAH_STRING_IDENTIFIER = 'makkah'; // the value is coming from the backend, ideally we would've set it up as an enum, but other pieces of the code are relying on this as a string, so we'll keep it as a string for now.
type RevelationOrderViewProps = {
  isDescending: boolean;
  chapters: Chapter[];
};

const RevelationOrderView = ({ isDescending, chapters }: RevelationOrderViewProps) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const [clickedSurahId, setClickedSurahId] = useState(null);

  const onSurahClicked = (surahId: string | number) => {
    if (isLoggedIn()) {
      setClickedSurahId(surahId);
      onSettingsChange(
        'isReadingByRevelationOrder',
        true,
        setIsReadingByRevelationOrder(true),
        setIsReadingByRevelationOrder(false),
        PreferenceGroup.READING,
        () => {
          // navigate to the selected Surah on success
          router.push(getSurahNavigationUrl(surahId));
        },
      );
    } else {
      setIsReadingByRevelationOrder(true);
      router.push(getSurahNavigationUrl(surahId));
    }
    logButtonClick('revelation_ordering_surah');
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
        <div
          role="button"
          tabIndex={0}
          className={styles.chapterContainer}
          key={chapter.id}
          onClick={() => onSurahClicked(chapter.id)}
          onKeyPress={() => onSurahClicked(chapter.id)}
        >
          <SurahPreviewRow
            chapterId={Number(chapter.id)}
            description={getChapterDescription(chapter, t)}
            surahName={`${chapter.transliteratedName}`}
            surahNumber={
              isDescending
                ? QURAN_CHAPTERS_COUNT - Number(revelationOrderIndex)
                : Number(revelationOrderIndex + 1)
            } // Show the number based on the revelation order instead of the surah number.
            translatedSurahName={getTranslatedSurahName(chapter, t, lang)}
            isMinimalLayout={false}
            isLoading={isLoading && clickedSurahId === chapter.id}
          />
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
    return `${t('common:surah')} ${toLocalizedNumber(Number(chapter.id), lang)}`;
  }
  return `${toLocalizedNumber(Number(chapter.id), lang)}: ${chapter.translatedName as string}`;
};

export default RevelationOrderView;
