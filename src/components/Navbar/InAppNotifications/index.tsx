import { useState } from 'react';

import { useSelector } from 'react-redux';

import NotificationBell from './NotificationBell';
import NotificationsList from './NotificationsList';

import Popover from '@/dls/Popover';
import { ContentSide } from '@/dls/Tooltip';
import { useNotifications } from '@/notifications/NotificationContext';
import { selectUnseenCount } from '@/redux/slices/notifications';

const InAppNotifications = () => {
  const [showModal, setShowModal] = useState(false);

  const { fetchNotifications } = useNotifications();
  const unseenCount = useSelector(selectUnseenCount);

  const onBellClicked = async () => {
    setShowModal((prevShowModal) => !prevShowModal);
  };

  const onOpenChange = (open: boolean) => {
    setShowModal(open);
    fetchNotifications.fetch({
      page: 0,
      shouldMarkAsSeenOnSuccess: true,
      shouldResetOldData: true,
    });
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
