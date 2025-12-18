import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ShareIcon from '@/icons/share.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  onActionTriggered?: () => void;
  openShareModal?: () => void;
}

const ShareMenuItem: React.FC<Props> = ({ onActionTriggered, openShareModal }) => {
  const { t } = useTranslation('common');

  const onShareClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_share');
    openShareModal?.();
    onActionTriggered?.();
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<ShareIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onShareClicked}
    >
      {t('share')}
    </PopoverMenu.Item>
  );
};

export default ShareMenuItem;
