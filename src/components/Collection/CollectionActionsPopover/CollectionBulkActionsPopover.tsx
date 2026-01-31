import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

type CollectionBulkActionsPopoverProps = {
  children: React.ReactNode;
  onNoteClick: () => void;
  align?: PopoverMenuAlign;
  dataTestPrefix?: string;
};

const CollectionBulkActionsPopover: React.FC<CollectionBulkActionsPopoverProps> = ({
  children,
  onNoteClick,
  align = PopoverMenuAlign.END,
  dataTestPrefix = 'collection-bulk-actions',
}) => {
  const { t } = useTranslation('quran-reader');

  const handleNoteClick = () => {
    onNoteClick();
  };

  return (
    <PopoverMenu align={align} trigger={children}>
      <PopoverMenu.Item
        onClick={handleNoteClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-note`}
        className={styles.menuItem}
      >
        <IconContainer
          className={styles.iconWrapper}
          size={IconSize.Custom}
          shouldForceSetColors={false}
          shouldFlipOnRTL={false}
          icon={<NotesWithPencilIcon />}
        />
        <span className={styles.menuItemText}>{t('take-a-note')}</span>
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default CollectionBulkActionsPopover;
