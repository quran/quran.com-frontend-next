import { useState } from 'react';

import NotificationBell from './NotificationBell';
import NotificationsList from './NotificationsList';

import Popover from '@/dls/Popover';
import { ContentSide } from '@/dls/Tooltip';
import { useNotification } from 'src/contexts/NotificationContext';

const InAppNotifications = () => {
  const [showModal, setShowModal] = useState(false);

  const { fetchNotifications, unseenCount } = useNotification();

  const onBellClicked = async () => {
    setShowModal((prevShowModal) => !prevShowModal);
    await fetchNotifications(true);
  };

  const onOpenChange = (open: boolean) => {
    setShowModal(open);
  };

  return (
    <Popover
      contentSide={ContentSide.TOP}
      contentSideOffset={-10}
      trigger={
        <NotificationBell unseenNotificationsCount={unseenCount} onBellClicked={onBellClicked} />
      }
      isModal
      open={showModal}
      tip
      onOpenChange={onOpenChange}
      defaultStyling
      isPortalled={false}
    >
      <NotificationsList />
    </Popover>
  );
};

export default InAppNotifications;
