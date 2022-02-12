import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import ContentModalHandles from 'src/components/dls/ContentModal/types/ContentModalHandles';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { getVerseSelectedTafsirNavigationUrl } from 'src/utils/navigation';

const TafsirBody = dynamic(() => import('./TafsirBody'), { ssr: false });
const ContentModal = dynamic(() => import('src/components/dls/ContentModal/ContentModal'), {
  ssr: false,
});

type TafsirVerseActionProps = {
  verseNumber: number;
  chapterId: number;
  isTranslationView: boolean;
};

const TafsirVerseAction = ({
  chapterId,
  verseNumber,
  isTranslationView,
}: TafsirVerseActionProps) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);

  const contentModalRef = useRef<ContentModalHandles>();

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        onClick={() => {
          logButtonClick(
            `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_tafsir`,
          );
          setIsContentModalOpen(true);
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      {isContentModalOpen && (
        <TafsirBody
          initialChapterId={chapterId.toString()}
          initialVerseNumber={verseNumber.toString()}
          scrollToTop={() => {
            contentModalRef.current.scrollToTop();
          }}
          render={({ body, languageAndTafsirSelection, surahAndAyahSelection }) => {
            return (
              <ContentModal
                innerRef={contentModalRef}
                url={getVerseSelectedTafsirNavigationUrl(chapterId, verseNumber, tafsirs[0])}
                isOpen={isContentModalOpen}
                hasCloseButton
                onClose={() => {
                  logEvent(
                    `${isTranslationView ? 'translation_view' : 'reading_view'}_tafsir_modal_close`,
                  );
                  setIsContentModalOpen(false);
                }}
                header={surahAndAyahSelection}
              >
                {languageAndTafsirSelection}
                {body}
              </ContentModal>
            );
          }}
        />
      )}
    </>
  );
};

export default TafsirVerseAction;
