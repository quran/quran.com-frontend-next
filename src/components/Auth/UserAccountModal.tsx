import dynamic from 'next/dynamic';

import Modal from '@/dls/Modal/Modal';
import useSyncUserData from '@/hooks/auth/useSyncUserData';
import ConsentType from '@/types/auth/ConsentType';
import Announcement from 'types/auth/Announcement';

const AnnouncementModalBodyResolver = dynamic(
  () => import('@/components/Auth/Announcements/AnnouncementModalBodyResolver'),
);
const ConsentModalBodyResolver = dynamic(
  () => import('@/components/Auth/Consents/ConsentModalBodyResolver'),
);

const requiredConsentsEnabled = process.env.NEXT_PUBLIC_ENABLE_REQUIRED_CONSENTS === 'true';
const REQUIRED_CONSENTS = [ConsentType.COMMUNICATION];

type Props = {
  announcement: Announcement;
  consents: Record<string, boolean>;
};

const UserAccountModal: React.FC<Props> = ({ announcement, consents }) => {
  useSyncUserData();

  let modalBody;
  if (announcement) {
    modalBody = <AnnouncementModalBodyResolver announcement={announcement} />;
  } else if (requiredConsentsEnabled && consents) {
    const missingConsents = REQUIRED_CONSENTS.filter(
      (consent) => !Object.keys(consents).includes(consent),
    );
    if (missingConsents.length > 0) {
      modalBody = <ConsentModalBodyResolver missingConsents={missingConsents} />;
    }
  }

  const isOpen = !!modalBody;

  return <Modal isOpen={isOpen}>{modalBody}</Modal>;
};

export default UserAccountModal;
