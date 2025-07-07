import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import VerseActionsMenuType from '../types';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  onMenuChange: (menu: VerseActionsMenuType) => void;
}

const MoreMenuItem: React.FC<Props> = ({ onMenuChange }) => {
  const { t } = useTranslation('common');

  const onMoreClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_more');
    onMenuChange(VerseActionsMenuType.More);
  };

  return (
    <PopoverMenu.Item icon={<OverflowMenuIcon />} onClick={onMoreClicked}>
      {t('more')}
    </PopoverMenu.Item>
  );
};

export default MoreMenuItem;
