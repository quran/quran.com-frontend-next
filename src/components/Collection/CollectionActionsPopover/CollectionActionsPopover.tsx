import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

export type CollectionAction = 'note' | 'delete' | 'move' | 'copy';

type CollectionActionsPopoverProps = {
  children: React.ReactNode;
  onNoteClick: () => void;
  availableActions?: CollectionAction[];
  align?: PopoverMenuAlign;
  dataTestPrefix?: string;
};

const CollectionActionsPopover: React.FC<CollectionActionsPopoverProps> = ({
  children,
  onNoteClick,
  availableActions = ['note'],
  align = PopoverMenuAlign.END,
  dataTestPrefix = 'collection-actions',
}) => {
  const { t } = useTranslation('quran-reader');

  const handleNoteClick = () => {
    onNoteClick();
  };

  return (
    <PopoverMenu align={align} trigger={children}>
      {availableActions.includes('note') && (
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
      )}
    </PopoverMenu>
  );
};

export default CollectionActionsPopover;
