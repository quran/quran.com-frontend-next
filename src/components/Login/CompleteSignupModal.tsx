import dynamic from 'next/dynamic';

import Modal from 'src/components/dls/Modal/Modal';
import { AUTH_ONBOARDING_ANNOUNCEMENT_TYPE } from 'src/utils/auth/constants';
import { isLoggedIn } from 'src/utils/auth/login';
import Announcement from 'types/auth/Announcement';
import FormField from 'types/FormField';

const CompleteSignupForm = dynamic(() => import('./CompleteSignupForm'));
const WelcomeMessageModalBody = dynamic(() => import('./WelcomeMessageModalBody'));

type CompleteSignupModalProps = {
  requiredFields: FormField[];
  announcements: Announcement[];
};

// TODO: rename this component, as it handles welcome message and complete signup form now
const CompleteSignupModal = ({ requiredFields, announcements }: CompleteSignupModalProps) => {
  let modalBody;
  if (
    isLoggedIn() &&
    announcements?.length > 0 &&
    announcements[0].type === AUTH_ONBOARDING_ANNOUNCEMENT_TYPE
  ) {
    modalBody = <WelcomeMessageModalBody />;
  } else if (requiredFields && requiredFields?.length !== 0) {
    modalBody = <CompleteSignupForm requiredFields={requiredFields} />;
  }
  const isOpen = !!modalBody;

  return <Modal isOpen={isOpen}>{modalBody}</Modal>;
};

export default CompleteSignupModal;
