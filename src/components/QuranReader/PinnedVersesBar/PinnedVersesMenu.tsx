import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './PinnedVersesBar.module.scss';
import menuStyles from './PinnedVersesMenu.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import CopyIcon from '@/icons/copy.svg';
import FolderIcon from '@/icons/folder.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import NotesIcon from '@/icons/notes-with-pencil.svg';
import TrashIcon from '@/icons/trash.svg';
import BookmarkIcon from '@/icons/unbookmarked.svg';

interface PinnedVersesMenuProps {
  onClear: () => void;
  onSaveToCollection?: () => void;
  onLoadFromCollection?: () => void;
  onCopy?: () => void;
  onAddNote?: () => void;
}

const PinnedVersesMenu: React.FC<PinnedVersesMenuProps> = ({
  onClear,
  onSaveToCollection,
  onLoadFromCollection,
  onCopy,
  onAddNote,
}) => {
  const { t } = useTranslation('quran-reader');

  return (
    <PopoverMenu
      contentClassName={menuStyles.menuContent}
      align={PopoverMenuAlign.END}
      trigger={
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          tooltip={t('common:more')}
          ariaLabel={t('common:more')}
          className={styles.moreButton}
        >
          <OverflowMenuIcon />
        </Button>
      }
    >
      <PopoverMenu.Item
        icon={<BookmarkIcon className={menuStyles.menuItemIcon} />}
        onClick={onSaveToCollection}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('save-pinned-to-collection')}</span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<FolderIcon className={menuStyles.menuItemIcon} />}
        onClick={onLoadFromCollection}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('load-from-collection')}</span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<NotesIcon className={menuStyles.menuItemIcon} />}
        onClick={onAddNote}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('take-a-note')}</span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<CopyIcon className={menuStyles.menuItemIcon} />}
        onClick={onCopy}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('copy-pinned')}</span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<TrashIcon className={menuStyles.menuItemIcon} />}
        onClick={onClear}
        shouldCloseMenuAfterClick
        className={menuStyles.menuItem}
      >
        <span className={menuStyles.menuItemText}>{t('clear-pinned')}</span>
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default PinnedVersesMenu;
