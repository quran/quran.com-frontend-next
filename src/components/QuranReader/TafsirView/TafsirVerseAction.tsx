import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import TafsirBody from './TafsirBody';

import ContentModal from 'src/components/dls/ContentModal/ContentModal';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { getVerseSelectedTafsirNavigationUrl } from 'src/utils/navigation';

type TafsirVerseActionProps = {
  verseNumber: number;
  chapterId: number;
};

const TafsirVerseAction = ({ chapterId, verseNumber }: TafsirVerseActionProps) => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { t } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        onClick={() => {
          logButtonClick('verse_actions_menu_tafsir');
          setIsContentModalOpen(true);
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      <ContentModal
        url={getVerseSelectedTafsirNavigationUrl(chapterId, verseNumber, tafsirs[0])}
        isOpen={isContentModalOpen}
        hasCloseButton
        onClose={() => {
          logEvent('tafsir_modal_close');
          setIsContentModalOpen(false);
        }}
      >
        <TafsirBody
          initialChapterId={chapterId.toString()}
          initialVerseNumber={verseNumber.toString()}
        />
      </ContentModal>
    </>
  );
};

export default TafsirVerseAction;
