import { useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import WordByWordHeading from './WordByWordHeading';
import styles from './WordByWordVerseAction.module.scss';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
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
};

const CLOSE_POPOVER_AFTER_MS = 150;

const WordByWordVerseAction: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();

  const onModalClosed = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent(`reading_view_wbw_modal_close`);
    setIsContentModalOpen(false);
    if (onActionTriggered) {
      setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  const onIconClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`reading_view_verse_actions_menu_wbw`);
    setIsContentModalOpen(true);
  };

  return (
    <>
      <PopoverMenu.Item icon={<SearchIcon />} onClick={onIconClicked}>
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
        <WordByWordHeading isTranslation />
        <PlainVerseText words={verse.words} shouldShowWordByWordTranslation />
        <Separator className={styles.separator} />
        <WordByWordHeading isTranslation={false} />
        <PlainVerseText words={verse.words} shouldShowWordByWordTransliteration />
      </ContentModal>
    </>
  );
};

export default WordByWordVerseAction;
