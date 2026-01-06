import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import VerseActionsMenuType from '../types';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  onMenuChange: (menu: VerseActionsMenuType) => void;
  targetMenu?: VerseActionsMenuType;
  label?: string;
  logAction?: string;
}

/**
 * A reusable back menu item component that can navigate to any menu type
 * and display a custom label with configurable logging action
 * @returns {JSX.Element} A PopoverMenu.Item component that navigates back to the specified menu
 */
const BackMenuItem: React.FC<Props> = ({
  onMenuChange,
  targetMenu = VerseActionsMenuType.Main,
  label,
  logAction = 'back_verse_actions_menu',
}) => {
  const { t } = useTranslation('common');
  const displayLabel = label || t('back');

  const onBackClicked = () => {
    logButtonClick(logAction);
    onMenuChange(targetMenu);
  };

  return (
    <PopoverMenu.Item icon={<ChevronLeftIcon />} onClick={onBackClicked} shouldFlipOnRTL>
      {displayLabel}
    </PopoverMenu.Item>
  );
};

export default BackMenuItem;
