import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import CopyIcon from '@/icons/copy.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';
import PinIcon from '@/icons/pin.svg';
import TrashIcon from '@/icons/trash.svg';

type CollectionBulkActionsPopoverProps = {
  children: React.ReactNode;
  onCopyClick: () => void;
  onDeleteClick?: () => void;
  onNoteClick: () => void;
  onPinVersesClick: () => void;
  align?: PopoverMenuAlign;
  dataTestPrefix?: string;
};

const CollectionBulkActionsPopover: React.FC<CollectionBulkActionsPopoverProps> = ({
  children,
  onCopyClick,
  onDeleteClick,
  onNoteClick,
  onPinVersesClick,
  align = PopoverMenuAlign.END,
  dataTestPrefix = 'collection-bulk-actions',
}) => {
  const { t } = useTranslation();

  return (
    <PopoverMenu align={align} trigger={children}>
      <PopoverMenu.Item
        onClick={onCopyClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-copy`}
        className={styles.menuItem}
      >
        <IconContainer
          className={styles.iconWrapper}
          size={IconSize.Custom}
          shouldForceSetColors={false}
          icon={<CopyIcon />}
        />
        <span className={styles.menuItemText}>{t('common:copy')}</span>
      </PopoverMenu.Item>
      {!!onDeleteClick && (
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
          <span className={styles.menuItemText}>{t('common:delete')}</span>
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

export default CollectionBulkActionsPopover;
