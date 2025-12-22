import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import { useOverlayModal, OverlayType } from '@/hooks/useOverlayModal';
import ChatIcon from '@/icons/chat.svg';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';
import { getVerseReflectionNavigationUrl } from '@/utils/navigation';

interface Props {
  verse: WordVerse;
  onActionTriggered?: () => void;
}

const QuranReflectMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t } = useTranslation('common');
  const { verseKey } = verse;

  const { open } = useOverlayModal({
    verseKey,
    overlayType: OverlayType.REFLECTIONS,
  });

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_reflect');
    open(getVerseReflectionNavigationUrl(verseKey));
    onActionTriggered?.();
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<ChatIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onMenuItemClicked}
    >
      {t('reflections-and-lessons')}
    </PopoverMenu.Item>
  );
};

export default QuranReflectMenuItem;
