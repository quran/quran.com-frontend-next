import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionVerseCell.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import CopyIcon from '@/icons/copy.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import PinFilledIcon from '@/icons/pin-filled.svg';
import PinIcon from '@/icons/pin.svg';
import ShareIcon from '@/icons/share.svg';
import TrashIcon from '@/icons/trash.svg';
import pinIconStyles from '@/styles/pinIcon.module.scss';
import PopoverMenu, { PopoverMenuAlign } from 'src/components/dls/PopoverMenu/PopoverMenu';

interface CollectionVerseCellMenuProps {
  isPinned: boolean;
  isOwner: boolean;
  onPinToggle: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCopy: () => void;
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
  onShare,
  onCopy,
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <PopoverMenu
      isOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      contentClassName={styles.popoverContainer}
      align={PopoverMenuAlign.END}
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
      <div>
        {isOwner && (
          <PopoverMenu.Item
            onClick={onDelete}
            shouldCloseMenuAfterClick
            shouldStopPropagation
            icon={
              <IconContainer
                size={IconSize.Xsmall}
                icon={<TrashIcon />}
                color={IconColor.tertiary}
                shouldForceSetColors
                className={styles.menuIcon}
              />
            }
          >
            {t('common:delete')}
          </PopoverMenu.Item>
        )}
        <PopoverMenu.Item
          onClick={onShare}
          shouldCloseMenuAfterClick
          shouldStopPropagation
          icon={
            <IconContainer
              size={IconSize.Xsmall}
              icon={<ShareIcon />}
              color={IconColor.tertiary}
              shouldForceSetColors
              className={styles.menuIcon}
            />
          }
        >
          {t('common:share')}
        </PopoverMenu.Item>
        <PopoverMenu.Item
          onClick={onCopy}
          shouldCloseMenuAfterClick
          shouldStopPropagation
          icon={
            <IconContainer
              size={IconSize.Xsmall}
              icon={<CopyIcon />}
              color={IconColor.tertiary}
              shouldForceSetColors
              className={styles.menuIcon}
            />
          }
        >
          {t('common:copy')}
        </PopoverMenu.Item>
        <PopoverMenu.Item
          onClick={onPinToggle}
          shouldCloseMenuAfterClick
          shouldStopPropagation
          icon={
            <IconContainer
              icon={isPinned ? <PinFilledIcon /> : <PinIcon />}
              color={isPinned ? undefined : IconColor.tertiary}
              shouldForceSetColors={!isPinned}
              className={classNames(styles.menuIcon, { [pinIconStyles.pinned]: isPinned })}
              size={IconSize.Xsmall}
              shouldFlipOnRTL={false}
            />
          }
        >
          {isPinned ? t('quran-reader:unpin-verse') : t('my-quran:bulk-actions.pin')}
        </PopoverMenu.Item>
      </div>
    </PopoverMenu>
  );
};

export default CollectionVerseCellMenu;
