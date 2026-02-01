import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionVerseCell.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

interface CollectionVerseCellMenuProps {
  isPinned: boolean;
  isOwner: boolean;
  onPinToggle: () => void;
  onDelete: () => void;
  onGoToAyah: () => void;
}

/**
 * Overflow menu for a collection verse cell.
 *
 * @param {CollectionVerseCellMenuProps} props - Component props.
 * @returns {JSX.Element} The menu component.
 */
const CollectionVerseCellMenu: React.FC<CollectionVerseCellMenuProps> = ({
  isPinned,
  isOwner,
  onPinToggle,
  onDelete,
  onGoToAyah,
}) => {
  const { t } = useTranslation();

  return (
    <PopoverMenu
      trigger={
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={t('common:more')}
          className={styles.iconButton}
        >
          <OverflowMenuIcon className={styles.dot3} />
        </button>
      }
    >
      {isOwner && <PopoverMenu.Item onClick={onDelete}>{t('common:delete')}</PopoverMenu.Item>}
      <PopoverMenu.Item
        onClick={onPinToggle}
        shouldCloseMenuAfterClick
        icon={
          <IconContainer
            icon={isPinned ? <PinFilledIcon /> : <PinIcon />}
            color={isPinned ? IconColor.primary : IconColor.tertiary}
            size={IconSize.Xsmall}
            shouldFlipOnRTL={false}
          />
        }
      >
        {isPinned ? t('quran-reader:unpin-verse') : t('my-quran:bulk-actions.pin')}
      </PopoverMenu.Item>
      <PopoverMenu.Item onClick={onGoToAyah} shouldCloseMenuAfterClick>
        {t('collection:go-to-ayah')}
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default CollectionVerseCellMenu;
