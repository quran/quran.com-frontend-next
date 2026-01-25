import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import FeedbackIcon from '@/icons/translation-feedback.svg';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openFeedbackModal } from '@/redux/slices/QuranReader/verseActionModal';
import Verse from '@/types/Verse';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

interface TranslationFeedbackActionProps {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  isInsideStudyMode?: boolean;
}

const TranslationFeedbackAction: React.FC<TranslationFeedbackActionProps> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  isInsideStudyMode = false,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation('quran-reader');
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  const handleClick = useCallback(() => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      return;
    }

    // Use isInsideStudyMode prop to determine if opened from study mode
    const openedFromStudyMode = isInsideStudyMode || (isStudyModeOpen && !isSsrMode);

    // Dispatch Redux action to open translation feedback modal
    dispatch(
      openFeedbackModal({
        verseKey: verse.verseKey,
        verse,
        isTranslationView,
        wasOpenedFromStudyMode: openedFromStudyMode,
        studyModeRestoreState:
          openedFromStudyMode && studyModeVerseKey
            ? {
                verseKey: studyModeVerseKey,
                activeTab: studyModeActiveTab,
                highlightedWordLocation: studyModeHighlightedWordLocation,
                isSsrMode,
              }
            : undefined,
      }),
    );

    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_translation_feedback_modal_open`,
    );

    if (onActionTriggered) {
      onActionTriggered();
    }
  }, [
    router,
    verse,
    isTranslationView,
    isInsideStudyMode,
    isStudyModeOpen,
    isSsrMode,
    studyModeVerseKey,
    studyModeActiveTab,
    studyModeHighlightedWordLocation,
    dispatch,
    onActionTriggered,
  ]);

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer icon={<FeedbackIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
      }
      onClick={handleClick}
      shouldCloseMenuAfterClick
      dataTestId="verse-actions-menu-translation-feedback"
    >
      {t('translation-feedback.title')}
    </PopoverMenu.Item>
  );
};

export default TranslationFeedbackAction;
