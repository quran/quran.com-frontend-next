import dynamic from 'next/dynamic';

import Modal from 'src/components/dls/Modal/Modal';
import { isLoggedIn } from 'src/utils/auth/login';
import FormField from 'types/FormField';

const CompleteSignupForm = dynamic(() => import('./CompleteSignupForm'));
const WelcomeMessageModalBody = dynamic(() => import('./WelcomeMessageModalBody'));

type CompleteSignupModalProps = {
  requiredFields: FormField[];
  isOnboarded?: boolean;
};

// TODO: rename this component, as it handles welcome message and complete signup form now
const CompleteSignupModal = ({ requiredFields, isOnboarded }: CompleteSignupModalProps) => {
  let modalBody;
  if (isLoggedIn() && !isOnboarded) {
    modalBody = <WelcomeMessageModalBody />;
  } else if (requiredFields && requiredFields?.length !== 0) {
    modalBody = <CompleteSignupForm requiredFields={requiredFields} />;
  }
  const isOpen = !!modalBody;

  return <Modal isOpen={isOpen}>{modalBody}</Modal>;
};

export default CompleteSignupModal;
