import React, { useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChatIcon from '@/icons/chat.svg';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getVerseReflectionNavigationUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  verse: WordVerse;
  onActionTriggered?: () => void;
}

const QuranReflectMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { verseKey } = verse;

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_reflect');
    setIsContentModalOpen(true);
    fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  };

  const contentModalRef = useRef(null);

  const onModalClose = () => {
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, lang);
    onActionTriggered?.();
  };

  const [initialChapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  return (
    <>
      <PopoverMenu.Item
        icon={
          <IconContainer icon={<ChatIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
        }
        onClick={onMenuItemClicked}
      >
        {t('reflections-and-lessons')}
      </PopoverMenu.Item>
      <ReflectionBodyContainer
        initialChapterId={initialChapterId}
        initialVerseNumber={verseNumber}
        isModal
        scrollToTop={() => {
          contentModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={contentModalRef}
            isOpen={isContentModalOpen}
            hasCloseButton
            onClose={onModalClose}
            onEscapeKeyDown={onModalClose}
            header={surahAndAyahSelection}
          >
            {body}
          </ContentModal>
        )}
      />
    </>
  );
};

export default QuranReflectMenuItem;
