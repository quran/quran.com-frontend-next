import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingModeWordHoverActions.module.scss';

import ReadingViewNoteAction from '@/components/Notes/modal/ReadingViewNoteAction';
import BookmarkAction from '@/components/Verse/BookmarkAction';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import ArrowIcon from '@/icons/arrow.svg';
import BookIcon from '@/icons/book-open.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import PlayIcon from '@/icons/play-outline.svg';
import RepeatIcon from '@/icons/repeat-new.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { Direction } from '@/utils/locale';
import Verse from 'types/Verse';

const DROPDOWN_SIDE_OFFSET = 5;

type Props = {
  verse: Verse;
  onOpenChange?: (open: boolean) => void;
  onMore: () => void;
  onPlayFromWord: () => void;
  onRepeatVerse: () => void;
};

const WordOptionsDropdown: React.FC<Props> = ({
  verse,
  onOpenChange,
  onMore,
  onPlayFromWord,
  onRepeatVerse,
}) => {
  const { t } = useTranslation('common');
  const direction = useDirection();
  const isRTL = direction === Direction.RTL;

  return (
    <PopoverMenu
      contentClassName={classNames(styles.menuContent, {
        [styles.menuContentRtl]: isRTL,
      })}
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
          <ArrowIcon
            className={classNames(styles.menuItemChevron, {
              [styles.menuItemChevronRtl]: isRTL,
            })}
          />
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

      <BookmarkAction
        verse={verse}
        isTranslationView={false}
        forceMenuItem
        shouldCloseMenuAfterClick
        unbookmarkedLabel={t('quran-reader:save-verse-short')}
        onActionClick={() => {
          logButtonClick('reading_word_3dots_save_verse', { verseKey: verse.verseKey });
        }}
      />

      <ReadingViewNoteAction
        verseKey={verse.verseKey}
        shouldCloseMenuAfterClick
        label={t('quran-reader:take-a-note')}
        onActionClick={() => {
          logButtonClick('reading_word_3dots_take_note', { verseKey: verse.verseKey });
        }}
      />

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
