import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import VerseActionsMenuType from '../types';

import styles from './MoreMenuItem.module.scss';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChevronRightIcon from '@/icons/chevron-right.svg';
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
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<OverflowMenuIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
        />
      }
      onClick={onMoreClicked}
    >
      <div className={styles.menuWithChevron}>
        {t('more')}
        <ChevronRightIcon />
      </div>
    </PopoverMenu.Item>
  );
};

export default MoreMenuItem;
