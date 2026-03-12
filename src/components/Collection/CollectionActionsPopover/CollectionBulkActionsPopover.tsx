import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
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
    <PopoverMenu align={align} trigger={children} contentClassName={styles.popoverContainer}>
      <PopoverMenu.Item
        onClick={onCopyClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-copy`}
        icon={
          <IconContainer
            size={IconSize.Xsmall}
            icon={<CopyIcon />}
            color={IconColor.tertiary}
            shouldForceSetColors
            className={styles.icon}
          />
        }
      >
        {t('common:copy')}
      </PopoverMenu.Item>
      {!!onDeleteClick && (
        <PopoverMenu.Item
          onClick={onDeleteClick}
          shouldCloseMenuAfterClick
          dataTestId={`${dataTestPrefix}-delete`}
          icon={
            <IconContainer
              size={IconSize.Xsmall}
              icon={<TrashIcon />}
              color={IconColor.tertiary}
              shouldForceSetColors
              className={styles.icon}
            />
          }
        >
          {t('common:delete')}
        </PopoverMenu.Item>
      )}
      <PopoverMenu.Item
        onClick={onPinVersesClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-pin`}
        icon={
          <IconContainer
            size={IconSize.Xsmall}
            icon={<PinIcon />}
            color={IconColor.tertiary}
            shouldForceSetColors
            className={styles.icon}
          />
        }
      >
        {t('my-quran:bulk-actions.pin-verses')}
      </PopoverMenu.Item>
      <PopoverMenu.Item
        onClick={onNoteClick}
        shouldCloseMenuAfterClick
        dataTestId={`${dataTestPrefix}-note`}
        icon={
          <IconContainer
            size={IconSize.Xsmall}
            icon={<NotesWithPencilIcon />}
            color={IconColor.tertiary}
            shouldForceSetColors
            className={styles.icon}
          />
        }
      >
        {t('quran-reader:take-a-note')}
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default CollectionBulkActionsPopover;
