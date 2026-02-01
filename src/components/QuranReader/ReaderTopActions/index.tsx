import React from 'react';

import { useSelector } from 'react-redux';

import styles from './ReaderTopActions.module.scss';

import TranslationSettingsButton from '@/components/chapters/ChapterHeader/components/TranslationSettingsButton';
import ReadingModeActions from '@/components/chapters/ChapterHeader/ReadingModeActions';
import useDirection from '@/hooks/useDirection';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { QuranReaderDataType } from '@/types/QuranReader';
import isInReadingMode from '@/utils/readingPreference';
import { VersesResponse } from 'types/ApiResponses';

interface ReaderTopActionsProps {
  initialData: VersesResponse;
  quranReaderDataType: QuranReaderDataType;
}

/**
 * A persistent top actions bar that shows Arabic/Translation mode switching buttons.
 * This component renders when:
 * - NOT starting at verse 1 (ChapterHeader handles verse 1 for all view types)
 * - Chapter view: Never shown (ChapterHeader handles this)
 * - Tafsir view: Never shown
 *
 * @param {ReaderTopActionsProps} props - The component props
 * @returns {JSX.Element|null} The actions bar or null if not shown
 */
const ReaderTopActions: React.FC<ReaderTopActionsProps> = ({
  initialData,
  quranReaderDataType,
}) => {
  const direction = useDirection();
  const readingPreference = useSelector(selectReadingPreference);

  const isReadingMode = isInReadingMode(readingPreference);

  // Get the first verse from initial data
  const firstVerse = initialData?.verses?.[0];

  // Determine if we should show this component based on the data type:
  // - Chapter: Never show - ChapterHeader always appears
  // - Tafsir: Never show
  // - Verse 1: Never show - ChapterHeader handles verse 1 for all view types
  // - All other cases: Show
  const shouldShow = (() => {
    if (!firstVerse) return false;

    // Never show for full chapter views - ChapterHeader handles this
    if (quranReaderDataType === QuranReaderDataType.Chapter) return false;

    // Never show for Tafsir views
    if (
      quranReaderDataType === QuranReaderDataType.Tafsir ||
      quranReaderDataType === QuranReaderDataType.SelectedTafsir
    ) {
      return false;
    }

    // Never show for verse 1 - ChapterHeader handles this for all view types
    if (firstVerse.verseNumber === 1) return false;

    // For all other cases (Verse, Page, Juz, Hizb, Rub, Ranges not at verse 1), show
    return true;
  })();

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div dir={direction} className={styles.topControls}>
        {isReadingMode ? <ReadingModeActions /> : <TranslationSettingsButton />}
      </div>
    </div>
  );
};

export default ReaderTopActions;
