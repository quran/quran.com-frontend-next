import dynamic from 'next/dynamic';

import Modal from 'src/components/dls/Modal/Modal';
import Announcement from 'types/auth/Announcement';
import FormField from 'types/FormField';

const CompleteSignupForm = dynamic(() => import('./CompleteSignupForm'));
const AnnouncementModalBodyResolver = dynamic(() => import('./AnnouncementModalBodyResolver'));

type CompleteSignupModalProps = {
  requiredFields: FormField[];
  announcement: Announcement;
};

// TODO: rename this component, as it handles welcome message and complete signup form now
const CompleteSignupModal = ({ requiredFields, announcement }: CompleteSignupModalProps) => {
  let modalBody;
  if (announcement) {
    modalBody = <AnnouncementModalBodyResolver announcement={announcement} />;
  } else if (requiredFields && requiredFields?.length !== 0) {
    modalBody = <CompleteSignupForm requiredFields={requiredFields} />;
  }
  const isOpen = !!modalBody;

  return <Modal isOpen={isOpen}>{modalBody}</Modal>;
};

export default CompleteSignupModal;
