import dynamic from 'next/dynamic';

import Modal from '@/dls/Modal/Modal';
import useSyncUserData from '@/hooks/auth/useSyncUserData';
import Announcement from 'types/auth/Announcement';
import FormField from 'types/FormField';

const CompleteSignupForm = dynamic(() => import('@/components/Login/CompleteSignupForm'));
const AnnouncementModalBodyResolver = dynamic(
  () => import('@/components/Auth/Announcements/AnnouncementModalBodyResolver'),
);

type Props = {
  requiredFields: FormField[];
  announcement: Announcement;
};

const UserAccountModal: React.FC<Props> = ({ requiredFields, announcement }) => {
  useSyncUserData();
  let modalBody;
  if (requiredFields && requiredFields?.length !== 0) {
    modalBody = <CompleteSignupForm requiredFields={requiredFields} />;
  } else if (announcement) {
    modalBody = <AnnouncementModalBodyResolver announcement={announcement} />;
  }
  const isOpen = !!modalBody;

  return <Modal isOpen={isOpen}>{modalBody}</Modal>;
};

export default UserAccountModal;
