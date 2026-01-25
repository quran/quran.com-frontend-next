import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import AdvancedCopyIcon from '@/icons/clipboard.svg';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openAdvancedCopyModal } from '@/redux/slices/QuranReader/verseActionModal';
import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type VerseActionAdvancedCopyProps = {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

/**
 * Action component for advanced copy functionality.
 * Dispatches Redux action to open the modal in VerseActionModalContainer.
 *
 * @returns {JSX.Element} The advanced copy action menu item
 */
const VerseActionAdvancedCopy = ({
  verse,
  isTranslationView,
  onActionTriggered,
}: VerseActionAdvancedCopyProps) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  const onModalOpen = useCallback(() => {
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_advanced_copy_modal_open`);

    dispatch(
      openAdvancedCopyModal({
        verseKey: verse.verseKey,
        verse,
        isTranslationView,
        wasOpenedFromStudyMode: isStudyModeOpen,
        studyModeRestoreState:
          isStudyModeOpen && studyModeVerseKey
            ? {
                verseKey: studyModeVerseKey,
                activeTab: studyModeActiveTab,
                highlightedWordLocation: studyModeHighlightedWordLocation,
                isSsrMode,
              }
            : undefined,
      }),
    );

    if (onActionTriggered) {
      onActionTriggered();
    }
  }, [
    verse,
    isTranslationView,
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
        <IconContainer
          icon={<AdvancedCopyIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onModalOpen}
      shouldCloseMenuAfterClick
    >
      {t('advanced-copy')}
    </PopoverMenu.Item>
  );
};

export default VerseActionAdvancedCopy;
