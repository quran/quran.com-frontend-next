import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import TafsirBody from './TafsirBody';

import EmbeddableContent from 'src/components/dls/EmbeddableContent/EmbeddableContent';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { logButtonClick } from 'src/utils/eventLogger';
import { fakeNavigate, getVerseTafsirNavigationUrl } from 'src/utils/navigation';

type TafsirVerseActionProps = {
  verseNumber: number;
  chapterId: number;
};

const TafsirVerseAction = ({ chapterId, verseNumber }: TafsirVerseActionProps) => {
  const [isEmbeddableContentOpen, setIsEmbeddableContentOpen] = useState(false);
  const { t } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const router = useRouter();

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        onClick={() => {
          logButtonClick('verse_actions_menu_tafsir');
          setIsEmbeddableContentOpen(true);
          fakeNavigate(getVerseTafsirNavigationUrl(chapterId, verseNumber, tafsirs[0].toString()));
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      <EmbeddableContent
        isOpen={isEmbeddableContentOpen}
        hasCloseButton
        onClose={() => {
          fakeNavigate(router.asPath);
          setIsEmbeddableContentOpen(false);
        }}
      >
        <TafsirBody
          initialChapterId={chapterId.toString()}
          initialVerseNumber={verseNumber.toString()}
        />
      </EmbeddableContent>
    </>
  );
};

export default TafsirVerseAction;
