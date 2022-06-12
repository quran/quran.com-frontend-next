import dynamic from 'next/dynamic';

import Modal from 'src/components/dls/Modal/Modal';
import FormField from 'types/FormField';

const CompleteSignupForm = dynamic(() => import('./CompleteSignupForm'));

type CompleteSignupModalProps = {
  requiredFields: FormField[];
};

const CompleteSignupModal = ({ requiredFields }: CompleteSignupModalProps) => {
  const isOpen = requiredFields && requiredFields?.length !== 0;
  return (
    <Modal isOpen={isOpen}>
      <CompleteSignupForm requiredFields={requiredFields} />
    </Modal>
  );
};

export default CompleteSignupModal;
