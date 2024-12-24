import { useState } from 'react';

import { useSelector } from 'react-redux';

import styles from './InAppNotifications.module.scss';
import NotificationBell from './NotificationBell';
import NotificationsList from './NotificationsList';

import { useNotifications } from '@/components/Notifications/InAppNotifications/NotificationContext';
import Popover from '@/dls/Popover';
import { ContentSide } from '@/dls/Tooltip';
import { selectUnseenCount } from '@/redux/slices/notifications';
import { logButtonClick } from '@/utils/eventLogger';

const InAppNotifications = () => {
  const [showModal, setShowModal] = useState(false);

  const { fetchNotifications } = useNotifications();
  const unseenCount = useSelector(selectUnseenCount);

  const onBellClicked = async () => {
    logButtonClick('notification_bell', { open: !showModal });
    setShowModal((prevShowModal) => !prevShowModal);
  };

  const onOpenChange = (open: boolean) => {
    setShowModal(open);

    if (open) {
      fetchNotifications.fetch({
        page: 0,
        shouldMarkAsSeenOnSuccess: true,
        shouldResetOldData: true,
      });
    }
  };

  return (
    <Popover
      contentSide={ContentSide.TOP}
      trigger={
        <NotificationBell unseenNotificationsCount={unseenCount} onBellClicked={onBellClicked} />
      }
      isModal
      tip
      contentStyles={styles.notificationsPopover}
      open={showModal}
      onOpenChange={onOpenChange}
      isPortalled={false}
    >
      <NotificationsList />
    </Popover>
  );
};

export default InAppNotifications;
