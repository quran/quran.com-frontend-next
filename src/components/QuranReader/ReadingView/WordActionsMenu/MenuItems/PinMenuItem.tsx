import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import {
  pinVerse,
  unpinVerse,
  selectPinnedVerseKeys,
} from '@/redux/slices/QuranReader/pinnedVerses';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
}

const PinMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const { verseKey } = verse;

  const pinnedVerseKeys = useSelector(selectPinnedVerseKeys);
  const isPinned = useMemo(() => pinnedVerseKeys.includes(verseKey), [pinnedVerseKeys, verseKey]);

  const handleClick = () => {
    if (isPinned) {
      logButtonClick('reading_view_unpin_verse');
      dispatch(unpinVerse(verseKey));
    } else {
      logButtonClick('reading_view_pin_verse');
      dispatch(pinVerse(verseKey));
    }
    onActionTriggered?.();
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={isPinned ? <PinFilledIcon /> : <PinIcon />}
          color={isPinned ? IconColor.primary : IconColor.tertiary}
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
