import React, { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './ChapterHeader.module.scss';
import BismillahSection from './components/BismillahSection';
import ChapterTitle from './components/ChapterTitle';
import TranslationSettingsButton from './components/TranslationSettingsButton';
import ReadingModeActions from './ReadingModeActions';

import PlayChapterAudioButton from '@/components/QuranReader/PlayChapterAudioButton';
import useDirection from '@/hooks/useDirection';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import Language from '@/types/Language';
import { getChapterData } from '@/utils/chapter';
import isInReadingMode from '@/utils/readingPreference';
import DataContext from 'src/contexts/DataContext';

interface ChapterHeaderProps {
  chapterId: string;
  translationName?: string;
  isTranslationView: boolean;
  className?: string;
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
  isTranslationView,
  className,
}) => {
  const { lang } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);
  const isArabicOrUrdu = lang === Language.AR || lang === Language.UR;
  const direction = useDirection();
  const readingPreference = useSelector(selectReadingPreference);

  // Check if we're in Reading mode (Arabic or Translation)
  const isReadingMode = isInReadingMode(readingPreference);

  return (
    <div className={classNames(styles.container, className)}>
      {/* Top controls section */}
      <div dir={direction} className={styles.topControls}>
        <div className={styles.leftControls}>
          <PlayChapterAudioButton chapterId={Number(chapterId)} />
        </div>
        <div className={styles.rightControls}>
          {isReadingMode ? (
            <ReadingModeActions />
          ) : (
            <TranslationSettingsButton translationName={translationName} />
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
