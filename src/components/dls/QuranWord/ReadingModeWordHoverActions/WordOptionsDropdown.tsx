import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingModeWordHoverActions.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import ArrowIcon from '@/icons/arrow.svg';
import BookIcon from '@/icons/book-open.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import PlayIcon from '@/icons/play-outline.svg';
import RepeatIcon from '@/icons/repeat-new.svg';
import { Direction } from '@/utils/locale';

const DROPDOWN_SIDE_OFFSET = 5;

type Props = {
  onOpenChange?: (open: boolean) => void;
  onMore: () => void;
  onPlayFromWord: () => void;
  onRepeatVerse: () => void;
};

const WordOptionsDropdown: React.FC<Props> = ({
  onOpenChange,
  onMore,
  onPlayFromWord,
  onRepeatVerse,
}) => {
  const { t } = useTranslation('common');

  return (
    <PopoverMenu
      contentClassName={styles.menuContent}
      dir={Direction.LTR}
      align={PopoverMenuAlign.END}
      sideOffset={DROPDOWN_SIDE_OFFSET}
      onOpenChange={onOpenChange}
      trigger={
        <button
          type="button"
          className={styles.threeDotsContainer}
          aria-label={t('more')}
          onClick={(e) => e.stopPropagation()}
        >
          <OverflowMenuIcon className={styles.threeDotsIcon} />
        </button>
      }
    >
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<BookIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onMore}
        shouldCloseMenuAfterClick
      >
        <span className={styles.menuItemContent}>
          {t('more')}
          <ArrowIcon className={styles.menuItemChevron} />
        </span>
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<PlayIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onPlayFromWord}
        shouldCloseMenuAfterClick
      >
        {t('quran-reader:play-from-word')}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<RepeatIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onRepeatVerse}
        shouldCloseMenuAfterClick
      >
        {t('audio.player.repeat-1-verse')}
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default WordOptionsDropdown;
