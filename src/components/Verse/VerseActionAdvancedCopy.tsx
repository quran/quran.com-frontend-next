import { useState } from 'react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PopoverMenu.Item icon={<AdvancedCopyIcon />} onClick={() => setIsModalOpen(true)}>
        Advanced Copy
      </PopoverMenu.Item>
      <Modal isOpen={isModalOpen} onClickOutside={() => setIsModalOpen(false)}>
        <VerseAdvancedCopy verse={verse}>
          {({ ayahSelectionComponent, actionText, onCopy, loading }) => (
            <>
              <Modal.Body>
                <Modal.Header>
                  <Modal.Title>Advanced Copy</Modal.Title>
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
