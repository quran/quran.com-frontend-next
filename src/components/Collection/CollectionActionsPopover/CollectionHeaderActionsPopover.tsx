import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import EditIcon from '@/icons/edit.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';
import PinIcon from '@/icons/pin.svg';
import TrashIcon from '@/icons/trash.svg';

type CollectionHeaderActionsPopoverProps = {
  children: React.ReactNode;
  onNoteClick: () => void;
  onPinVersesClick: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  align?: PopoverMenuAlign;
  dataTestPrefix?: string;
};

const CollectionHeaderActionsPopover: React.FC<CollectionHeaderActionsPopoverProps> = ({
  children,
  onNoteClick,
  onPinVersesClick,
  onEditClick,
  onDeleteClick,
  align = PopoverMenuAlign.END,
  dataTestPrefix = 'collection-header-actions',
}) => {
  const { t } = useTranslation();

  return (
    <PopoverMenu align={align} trigger={children}>
      {onEditClick && (
        <PopoverMenu.Item
          onClick={onEditClick}
          shouldCloseMenuAfterClick
          dataTestId={`${dataTestPrefix}-edit`}
          className={styles.menuItem}
        >
          <IconContainer
            className={styles.iconWrapper}
            size={IconSize.Custom}
            shouldForceSetColors={false}
            icon={<EditIcon />}
          />
          <span className={styles.menuItemText}>{t('collection:edit-collection')}</span>
        </PopoverMenu.Item>
      )}
      {onDeleteClick && (
        <PopoverMenu.Item
          onClick={onDeleteClick}
          shouldCloseMenuAfterClick
          dataTestId={`${dataTestPrefix}-delete`}
          className={styles.menuItem}
        >
          <IconContainer
            className={styles.iconWrapper}
            size={IconSize.Custom}
            shouldForceSetColors={false}
            icon={<TrashIcon />}
          />
          <span className={styles.menuItemText}>{t('collection:delete-collection-action')}</span>
        </PopoverMenu.Item>
      )}
      <PopoverMenu.Item
        onClick={onPinVersesClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-pin`}
        className={styles.menuItem}
      >
        <IconContainer
          className={styles.iconWrapper}
          size={IconSize.Custom}
          shouldForceSetColors={false}
          icon={<PinIcon />}
        />
        <span className={styles.menuItemText}>{t('my-quran:bulk-actions.pin-verses')}</span>
      </PopoverMenu.Item>
      <PopoverMenu.Item
        onClick={onNoteClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-note`}
        className={styles.menuItem}
      >
        <IconContainer
          className={styles.iconWrapper}
          size={IconSize.Custom}
          shouldForceSetColors={false}
          icon={<NotesWithPencilIcon />}
        />
        <span className={styles.menuItemText}>{t('quran-reader:take-a-note')}</span>
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default CollectionHeaderActionsPopover;
