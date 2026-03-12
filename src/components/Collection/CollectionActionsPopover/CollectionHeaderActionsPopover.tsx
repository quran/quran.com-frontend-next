import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionActionsPopover.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import EditIcon from '@/icons/bx-edit-alt.svg';
import CopyIcon from '@/icons/copy.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';
import PinIcon from '@/icons/pin.svg';
import TrashIcon from '@/icons/trash.svg';

type CollectionHeaderActionsPopoverProps = {
  children: React.ReactNode;
  onCopyClick?: () => void;
  onNoteClick: () => void;
  onPinVersesClick: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  isDisabledAllActions?: boolean;
  align?: PopoverMenuAlign;
  dataTestPrefix?: string;
};

const CollectionHeaderActionsPopover: React.FC<CollectionHeaderActionsPopoverProps> = ({
  children,
  onCopyClick,
  onNoteClick,
  onPinVersesClick,
  onEditClick,
  onDeleteClick,
  isDisabledAllActions,
  align = PopoverMenuAlign.END,
  dataTestPrefix = 'collection-header-actions',
}) => {
  const { t } = useTranslation();

  return (
    <PopoverMenu align={align} trigger={children} contentClassName={styles.popoverContainer}>
      {onEditClick && (
        <PopoverMenu.Item
          onClick={onEditClick}
          isDisabled={isDisabledAllActions}
          shouldCloseMenuAfterClick
          dataTestId={`${dataTestPrefix}-edit`}
          icon={
            <IconContainer
              size={IconSize.Xsmall}
              icon={<EditIcon />}
              color={IconColor.tertiary}
              shouldForceSetColors
              className={styles.icon}
            />
          }
        >
          {t('collection:edit-collection')}
        </PopoverMenu.Item>
      )}
      {onDeleteClick && (
        <PopoverMenu.Item
          onClick={onDeleteClick}
          shouldCloseMenuAfterClick
          isDisabled={isDisabledAllActions}
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
          {t('collection:delete-collection-action')}
        </PopoverMenu.Item>
      )}
      {onCopyClick && (
        <PopoverMenu.Item
          onClick={onCopyClick}
          shouldCloseMenuAfterClick
          isDisabled={isDisabledAllActions}
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
      )}
      <PopoverMenu.Item
        onClick={onPinVersesClick}
        shouldCloseMenuAfterClick
        isDisabled={isDisabledAllActions}
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
        isDisabled={isDisabledAllActions}
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

export default CollectionHeaderActionsPopover;
