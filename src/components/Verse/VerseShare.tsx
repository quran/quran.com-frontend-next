import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import VerseShareModal from '@/components/Verse/VerseShareModal';
import ShareIcon from '@/icons/share.svg';
import Verse from '@/types/Verse';
import { logButtonClick } from '@/utils/eventLogger';

type VerseActionRepeatAudioProps = {
  isTranslationView: boolean;
  verse: Verse;
};

const VerseShare = ({ isTranslationView, verse }: VerseActionRepeatAudioProps) => {
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onItemClicked = () => {
    if (isTranslationView) {
      logButtonClick('translation_view_verse_actions_menu_repeat');
    } else {
      logButtonClick('reading_view_verse_actions_menu_repeat');
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <VerseShareModal verse={verse} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <PopoverMenu.Item icon={<ShareIcon />} onClick={onItemClicked}>
        {t('share-modal.share-image')}
      </PopoverMenu.Item>
    </>
  );
};

export default VerseShare;
