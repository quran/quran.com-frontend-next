/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import TafsirBody from './TafsirBody';

import EmbeddableContent from 'src/components/dls/EmbeddableContent/EmbeddableContent';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
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

          // It's possible to achieve the same thing with nextjs' router.push,
          // but it will cause the page to be rerendered (not full reload)
          // and since our QuranReader is quite heavy, the UI will be quite janky
          // for example the navbar is expanded for a split second, the closed.
          // with pushState, it does not cause nextjs to re-render the page, which is better for performance
          // and not causing janky UI issues
          window.history.pushState(
            {},
            '',
            `/${verse.chapterId}/${verse.verseNumber}/tafsirs?tafsirsId=${tafsirs[0]}`,
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
