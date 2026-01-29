import React, { useCallback, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import {
  pinVerse,
  unpinVerse,
  selectPinnedVerseKeys,
} from '@/redux/slices/QuranReader/pinnedVerses';
import Verse from '@/types/Verse';
import { logButtonClick } from '@/utils/eventLogger';

interface PinVerseActionProps {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
}

const PinVerseAction: React.FC<PinVerseActionProps> = ({
  verse,
  isTranslationView,
  onActionTriggered,
}) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const { verseKey } = verse;

  // Use selectPinnedVerseKeys and derive isPinned from it
  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys);
  const isPinned = useMemo(() => pinnedVerseKeys.includes(verseKey), [pinnedVerseKeys, verseKey]);

  const handleClick = useCallback(() => {
    if (isPinned) {
      logButtonClick(
        isTranslationView ? 'unpin_verse_translation_view' : 'unpin_verse_reading_view',
      );
      dispatch(unpinVerse(verseKey));
    } else {
      logButtonClick(isTranslationView ? 'pin_verse_translation_view' : 'pin_verse_reading_view');
      dispatch(pinVerse(verseKey));
    }

    if (onActionTriggered) {
      onActionTriggered();
    }
  }, [dispatch, isPinned, isTranslationView, onActionTriggered, verseKey]);

  return (
    <PopoverMenu.Item
      onClick={handleClick}
      shouldCloseMenuAfterClick
      icon={
        <IconContainer
          icon={isPinned ? <PinFilledIcon /> : <PinIcon />}
          color={isPinned ? IconColor.primary : IconColor.tertiary}
          size={IconSize.Xsmall}
          shouldFlipOnRTL={false}
        />
      }
    >
      {isPinned ? t('unpin-verse') : t('pin-verse')}
    </PopoverMenu.Item>
  );
};

export default PinVerseAction;
