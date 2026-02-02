import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import usePinnedVerseSync from '@/hooks/usePinnedVerseSync';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import { selectPinnedVerseKeysSet } from '@/redux/slices/QuranReader/pinnedVerses';
import pinIconStyles from '@/styles/pinIcon.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
}

const PinMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t } = useTranslation('quran-reader');
  const { verseKey } = verse;
  const { pinVerseWithSync, unpinVerseWithSync } = usePinnedVerseSync();

  const pinnedVerseKeysSet = useSelector(selectPinnedVerseKeysSet);
  const isPinned = pinnedVerseKeysSet.has(verseKey);

  const handleClick = () => {
    if (isPinned) {
      logButtonClick('reading_view_unpin_verse');
      unpinVerseWithSync(verseKey);
    } else {
      logButtonClick('reading_view_pin_verse');
      pinVerseWithSync(verseKey);
    }
    onActionTriggered?.();
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={isPinned ? <PinFilledIcon /> : <PinIcon />}
          color={isPinned ? undefined : IconColor.tertiary}
          shouldForceSetColors={!isPinned}
          className={isPinned ? pinIconStyles.pinned : undefined}
          size={IconSize.Xsmall}
          shouldFlipOnRTL={false}
        />
      }
      onClick={handleClick}
    >
      {isPinned ? t('unpin-verse') : t('pin-verse')}
    </PopoverMenu.Item>
  );
};

export default PinMenuItem;
