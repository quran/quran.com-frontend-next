import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import AdvancedCopyIcon from '../../../public/icons/clipboard.svg';

import VerseAdvancedCopy from './AdvancedCopy/VerseAdvancedCopy';

import Modal from 'src/components/dls/Modal/Modal';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { logEvent } from 'src/utils/eventLogger';
import Verse from 'types/Verse';

type VerseActionAdvancedCopyProps = {
  verse: Verse;
  isTranslationView: boolean;
};

const VerseActionAdvancedCopy = ({ verse, isTranslationView }: VerseActionAdvancedCopyProps) => {
  const { t } = useTranslation('quran-reader');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    if (isTranslationView) {
      logEvent('translation_view_advanced_copy_modal_close');
    } else {
      logEvent('reading_view_advanced_copy_modal_close');
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <PopoverMenu.Item
        icon={<AdvancedCopyIcon />}
        onClick={() => {
          logEvent(
            `${isTranslationView ? 'translation_view' : 'reading_view'}_advanced_copy_modal_open`,
          );
          setIsModalOpen(true);
        }}
      >
        {t('advanced-copy')}
      </PopoverMenu.Item>
      <Modal
        isOpen={isModalOpen}
        isPropagationStopped
        onHitEsc={closeModal}
        onClickOutside={closeModal}
      >
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
