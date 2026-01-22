import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import PlusIcon from '@/icons/plus.svg';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openCollectionModal } from '@/redux/slices/QuranReader/verseActionModal';
import Verse from '@/types/Verse';
import { logButtonClick } from 'src/utils/eventLogger';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  bookmarksRangeUrl?: string;
}

/**
 * Action component for saving verses to collections.
 * Dispatches Redux action to open the modal in VerseActionModalContainer.
 *
 * @returns {React.ReactElement} The save to collection menu component.
 */
const SaveToCollectionAction: React.FC<Props> = ({
  verse,
  isTranslationView,
  bookmarksRangeUrl,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  const onMenuClicked = useCallback(() => {
    dispatch(
      openCollectionModal({
        verseKey: `${verse.chapterId}:${verse.verseNumber}`,
        verse,
        isTranslationView,
        bookmarksRangeUrl,
        wasOpenedFromStudyMode: isStudyModeOpen,
        studyModeRestoreState:
          isStudyModeOpen && studyModeVerseKey
            ? {
                verseKey: studyModeVerseKey,
                activeTab: studyModeActiveTab,
                highlightedWordLocation: studyModeHighlightedWordLocation,
              }
            : undefined,
      }),
    );

    if (isTranslationView) {
      logButtonClick('save_to_collection_menu_trans_view');
    } else {
      logButtonClick('save_to_collection_menu_reading_view');
    }
  }, [
    verse,
    isTranslationView,
    bookmarksRangeUrl,
    isStudyModeOpen,
    studyModeVerseKey,
    studyModeActiveTab,
    studyModeHighlightedWordLocation,
    dispatch,
  ]);

  return (
    <PopoverMenu.Item
      onClick={onMenuClicked}
      shouldCloseMenuAfterClick
      icon={
        <IconContainer
          icon={<PlusIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
    >
      {t('common:save-to-collection')}
    </PopoverMenu.Item>
  );
};

export default SaveToCollectionAction;
