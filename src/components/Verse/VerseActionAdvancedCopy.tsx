import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';

import VerseAdvancedCopy from './AdvancedCopy/VerseAdvancedCopy';

import Modal from 'src/components/dls/Modal/Modal';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Verse from 'types/Verse';

type VerseActionAdvancedCopyProps = {
  verse: Verse;
};

const VerseActionAdvancedCopy = ({ verse }: VerseActionAdvancedCopyProps) => {
  const { t } = useTranslation('quran-reader');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PopoverMenu.Item icon={<AdvancedCopyIcon />} onClick={() => setIsModalOpen(true)}>
        {t('advanced-copy')}
      </PopoverMenu.Item>
      <Modal isOpen={isModalOpen} onClickOutside={() => setIsModalOpen(false)}>
        <VerseAdvancedCopy verse={verse}>
          {({ ayahSelectionComponent, actionText, onCopy, loading }) => (
            <>
              <Modal.Body>
                <Modal.Header>
                  <Modal.Title>{t('advanced-copy')}</Modal.Title>
                </Modal.Header>
                {ayahSelectionComponent}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Action isDisabled={loading} onClick={onCopy}>
                  {loading ? <Spinner /> : actionText}
                </Modal.Action>
              </Modal.Footer>
            </>
          )}
        </VerseAdvancedCopy>
      </Modal>
    </>
  );
};

export default VerseActionAdvancedCopy;
