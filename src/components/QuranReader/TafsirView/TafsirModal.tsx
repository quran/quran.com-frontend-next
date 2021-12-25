import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import TafsirBody from './TafsirBody';

import EmbeddableContent from 'src/components/dls/EmbeddableContent/EmbeddableContent';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { getVerseTafsirNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

type TafsirModalProps = {
  verse: Verse;
};

const TafsirModal = ({ verse }: TafsirModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        onClick={() => {
          setIsModalOpen(true);

          window.history.pushState(
            {},
            '',
            getVerseTafsirNavigationUrl(verse.chapterId, verse.verseNumber, tafsirs[0].toString()),
          );
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      <EmbeddableContent isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TafsirBody
          initialChapterId={verse.chapterId.toString()}
          initialVerseNumber={verse.verseNumber.toString()}
        />
      </EmbeddableContent>
    </>
  );
};

export default TafsirModal;
