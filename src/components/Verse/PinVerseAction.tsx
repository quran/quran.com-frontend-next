import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import { selectPinnedVerseKeysSet } from '@/redux/slices/QuranReader/pinnedVerses';
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
  const { verseKey } = verse;
  const { pinVerseWithSync, unpinVerseWithSync } = usePinnedVerseSync();

  const pinnedVerseKeysSet = useSelector(selectPinnedVerseKeysSet);
  const isPinned = pinnedVerseKeysSet.has(verseKey);

  const handleClick = useCallback(() => {
    if (isPinned) {
      logButtonClick(
        isTranslationView ? 'unpin_verse_translation_view' : 'unpin_verse_reading_view',
      );
      unpinVerseWithSync(verseKey);
    } else {
      logButtonClick(isTranslationView ? 'pin_verse_translation_view' : 'pin_verse_reading_view');
      pinVerseWithSync(verseKey);
    }

    if (onActionTriggered) {
      onActionTriggered();
    }
  }, [isPinned, isTranslationView, onActionTriggered, verseKey, pinVerseWithSync, unpinVerseWithSync]);

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
