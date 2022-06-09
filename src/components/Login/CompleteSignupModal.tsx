import dynamic from 'next/dynamic';

import Modal from 'src/components/dls/Modal/Modal';
import { CompleteSignupRequestKey } from 'types/CompleteSignupRequest';

const CompleteSignupForm = dynamic(() => import('./CompleteSignupForm'));

type CompleteSignupModalProps = {
  requiredFields: CompleteSignupRequestKey[];
};

const CompleteSignupModal = ({ requiredFields }: CompleteSignupModalProps) => {
  const isOpen = requiredFields && requiredFields?.length !== 0;
  return (
    <Modal isOpen={isOpen}>
      <CompleteSignupForm requiredFields={['email', 'firstName', 'lastName']} />
    </Modal>
  );
};

export default CompleteSignupModal;
