/* eslint-disable i18next/no-literal-string */
import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ChapterHeader.module.scss';
import BismillahSection from './components/BismillahSection';
import ChapterTitle from './components/ChapterTitle';
import ReadingModeActions from './ReadingModeActions';

import PlayChapterAudioButton from '@/components/QuranReader/PlayChapterAudioButton';
import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import useDirection from '@/hooks/useDirection';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Language from '@/types/Language';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import isInReadingMode from '@/utils/readingPreference';
import DataContext from 'src/contexts/DataContext';
import { ReadingPreference } from 'types/QuranReader';

interface ChapterHeaderProps {
  chapterId: string;
  translationName?: string;
  translationsCount?: number;
  isTranslationView: boolean;
}

/**
 * The ChapterHeader component that is shown at the top of the chapter page.
 * It shows the chapter name, number, and bismillah.
 *
 * @param {ChapterHeaderProps} props
 * @returns {JSX.Element}
 */
const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  chapterId,
  translationName,
  translationsCount,
  isTranslationView,
}) => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);
  const isArabicOrUrdu = lang === Language.AR || lang === Language.UR;
  const direction = useDirection();
  const readingPreference = useSelector(selectReadingPreference);
  const selectedTranslations = useSelector(selectSelectedTranslations);

  // Check if we're in Reading mode (Arabic or Translation)
  const isReadingMode = isInReadingMode(readingPreference);

  // Check if we should show empty state (in ReadingTranslation mode with no translations)
  const isTranslationMode = readingPreference === ReadingPreference.ReadingTranslation;
  const hasTranslations = selectedTranslations && selectedTranslations.length > 0;
  const showEmptyState = isTranslationMode && !hasTranslations;

  const onChangeTranslationClicked = () => {
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('chapter_header_change_translation');
  };

  return (
    <div className={styles.container}>
      {/* Top controls section */}
      <div dir={direction} className={styles.topControls}>
        <div className={styles.leftControls}>
          {!showEmptyState && <PlayChapterAudioButton chapterId={Number(chapterId)} />}
        </div>
        <div className={styles.rightControls}>
          {isReadingMode ? (
            <ReadingModeActions />
          ) : (
            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.Small}
              shape={ButtonShape.Pill}
              onClick={onChangeTranslationClicked}
              ariaLabel={t('change-translation')}
              tooltip={t('change-translation')}
              className={styles.changeTranslationButton}
              contentClassName={styles.translationName}
              suffix={
                translationsCount > 1 && (
                  <span className={styles.translationsCount}>
                    {`+${toLocalizedNumber(translationsCount - 1, lang)}`}
                  </span>
                )
              }
            >
              <span>{translationName}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Chapter title section */}
      <ChapterTitle
        chapterId={chapterId}
        transliteratedName={chapterData.transliteratedName}
        translatedName={chapterData.translatedName}
        showTranslatedName={!isArabicOrUrdu}
      />

      {/* Bismillah section */}
      <BismillahSection
        chapterId={chapterId}
        showTranslatedName={isArabicOrUrdu}
        isTranslationView={isTranslationView}
      />
    </div>
  );
};

export default ChapterHeader;
