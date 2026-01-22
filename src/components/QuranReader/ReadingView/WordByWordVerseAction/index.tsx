import { useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import WordByWordHeading from './WordByWordHeading';
import styles from './WordByWordVerseAction.module.scss';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Separator from '@/dls/Separator/Separator';
import SearchIcon from '@/icons/search-book.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

const ContentModal = dynamic(() => import('@/dls/ContentModal/ContentModal'), {
  ssr: false,
});

type Props = {
  verse: Verse;
  onActionTriggered?: () => void;
  isTranslationView?: boolean;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const WordByWordVerseAction: React.FC<Props> = ({
  verse,
  onActionTriggered,
  isTranslationView,
}) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const onModalClosed = () => {
    logEvent(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_reading_view_wbw_modal_close`,
    );
    setIsContentModalOpen(false);
    if (onActionTriggered) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      closeTimeoutRef.current = setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  const onIconClicked = () => {
    logButtonClick(
      `${
        isTranslationView ? 'translation_view' : 'reading_view'
      }_reading_view_verse_actions_menu_wbw`,
    );
    setIsContentModalOpen(true);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<SearchIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onIconClicked}
      >
        {t('wbw')}
      </PopoverMenu.Item>
      <ContentModal
        innerRef={contentModalRef}
        isOpen={isContentModalOpen}
        header={<p className={styles.header} />}
        hasCloseButton
        onClose={onModalClosed}
        onEscapeKeyDown={onModalClosed}
      >
        <div data-testid="wbw-translation">
          <WordByWordHeading isTranslation />
          <PlainVerseText words={verse.words} shouldShowWordByWordTranslation />
        </div>
        <Separator className={styles.separator} />
        <div data-testid="wbw-transliteration">
          <WordByWordHeading isTranslation={false} />
          <PlainVerseText words={verse.words} shouldShowWordByWordTransliteration />
        </div>
      </ContentModal>
    </>
  );
};

export default WordByWordVerseAction;
