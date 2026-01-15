import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReaderTopActions.module.scss';

import ReadingModeActions from '@/components/chapters/ChapterHeader/ReadingModeActions';
import getTranslationNameString from '@/components/QuranReader/ReadingView/utils/translation';
import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import useDirection from '@/hooks/useDirection';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { QuranReaderDataType } from '@/types/QuranReader';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import isInReadingMode from '@/utils/readingPreference';
import { VersesResponse } from 'types/ApiResponses';

interface ReaderTopActionsProps {
  initialData: VersesResponse;
  quranReaderDataType: QuranReaderDataType;
}

/**
 * A persistent top actions bar that shows Arabic/Translation mode switching buttons.
 * This component only renders when the first verse is NOT verse 1 of a chapter,
 * since ChapterHeader already shows these actions when viewing from verse 1.
 *
 * @param {ReaderTopActionsProps} props - The component props
 * @returns {JSX.Element|null} The actions bar or null if not shown
 */
const ReaderTopActions: React.FC<ReaderTopActionsProps> = ({
  initialData,
  quranReaderDataType,
}) => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('quran-reader');
  const direction = useDirection();
  const readingPreference = useSelector(selectReadingPreference);
  const selectedTranslations = useSelector(selectSelectedTranslations);

  const isReadingMode = isInReadingMode(readingPreference);

  // Get the first verse from initial data
  const firstVerse = initialData?.verses?.[0];

  // Determine if we should show this component based on the data type:
  // - Chapter: Never show - ChapterHeader always appears at verse 1
  // - Verse/Ranges: Show only if not starting at verse 1
  // - Page/Juz/Hizb/Rub: Show only if first verse is not verse 1
  // - Tafsir: Never show
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

    // For all other types, show only if not starting at verse 1
    return firstVerse.verseNumber !== 1;
  })();

  const onChangeTranslationClicked = () => {
    dispatch(setSettingsView(SettingsView.Translation));
    logEvent('drawer_settings_open');
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('reader_top_actions_change_translation');
  };

  if (!shouldShow) {
    return null;
  }

  // Get translation info for the button
  const translationName = getTranslationNameString(firstVerse?.translations);
  const translationsCount = selectedTranslations?.length || 0;

  return (
    <div className={styles.container}>
      <div dir={direction} className={styles.topControls}>
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
  );
};

export default ReaderTopActions;
