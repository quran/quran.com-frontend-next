import React, { useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import BookOpenIcon from '@/icons/book-open.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { WordVerse } from '@/types/Word';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  verse: WordVerse;
  onActionTriggered?: () => void;
}

const TafsirMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { verseKey } = verse;
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_tafsir');
    setIsContentModalOpen(true);
    fakeNavigate(
      getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
      lang,
    );
  };

  const contentModalRef = useRef(null);

  const onModalClose = () => {
    logEvent('reading_view_tafsir_modal_close');
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    onActionTriggered?.();
  };

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<BookOpenIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
          />
        }
        onClick={onMenuItemClicked}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      <TafsirBody
        shouldRender={isContentModalOpen}
        initialChapterId={chapterId.toString()}
        initialVerseNumber={verseNumber.toString()}
        scrollToTop={() => {
          contentModalRef.current?.scrollToTop();
        }}
        render={({ body, languageAndTafsirSelection, surahAndAyahSelection }) => {
          return (
            <ContentModal
              innerRef={contentModalRef}
              isOpen={isContentModalOpen}
              hasCloseButton
              onClose={onModalClose}
              onEscapeKeyDown={onModalClose}
              header={surahAndAyahSelection}
            >
              {languageAndTafsirSelection}
              {body}
            </ContentModal>
          );
        }}
      />
    </>
  );
};

export default TafsirMenuItem;
