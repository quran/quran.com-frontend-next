import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import VerseNotesModal from './VerseNotesModal';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import RepeatIcon from '@/icons/repeat.svg';
import { logButtonClick } from '@/utils/eventLogger';

type VerseNotesProps = {
  verseKey: string;
};
const VerseNotes = ({ verseKey }: VerseNotesProps) => {
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onItemClicked = () => {
    // TODO: add loggin
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <VerseNotesModal isOpen={isModalOpen} onClose={onClose} />
      <PopoverMenu.Item icon={<RepeatIcon />} onClick={onItemClicked}>
        Add Notes
      </PopoverMenu.Item>
    </>
  );
};

export default VerseNotes;
