import { useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import TafsirIcon from '@/icons/book-open.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';

const TafsirBody = dynamic(() => import('./TafsirBody'), { ssr: false });
const ContentModal = dynamic(() => import('@/dls/ContentModal/ContentModal'), {
  ssr: false,
});

type TafsirVerseActionProps = {
  verseNumber: number;
  chapterId: number;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 150;

const TafsirVerseAction = ({
  chapterId,
  verseNumber,
  isTranslationView,
  onActionTriggered,
}: TafsirVerseActionProps) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t, lang } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const router = useRouter();

  const contentModalRef = useRef<ContentModalHandles>();

  const onModalClose = () => {
    if (isTranslationView) {
      logEvent('translation_view_tafsir_modal_close');
    } else {
      logEvent('reading_view_tafsir_modal_close');
    }
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    if (onActionTriggered) {
      setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        onClick={() => {
          logButtonClick(
            `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_tafsir`,
          );
          setIsContentModalOpen(true);
          fakeNavigate(
            getVerseSelectedTafsirNavigationUrl(chapterId, verseNumber, tafsirs[0]),
            lang,
          );
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>

      <TafsirBody
        shouldRender={isContentModalOpen}
        initialChapterId={chapterId.toString()}
        initialVerseNumber={verseNumber.toString()}
        scrollToTop={() => {
          contentModalRef.current.scrollToTop();
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

export default TafsirVerseAction;
