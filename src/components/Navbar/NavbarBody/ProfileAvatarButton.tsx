import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ProfileAvatarButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useLogout from '@/hooks/auth/useLogout';
import BookmarkIcon from '@/icons/bookmark.svg';
import ClockIcon from '@/icons/clock.svg';
import ReaderIcon from '@/icons/learning-plan.svg';
import LogoutIcon from '@/icons/logout.svg';
import NotesIcon from '@/icons/notes-with-pencil.svg';
import NotificationBellIcon from '@/icons/notification-bell.svg';
import IconPerson from '@/icons/person.svg';
import { setIsNavigationDrawerOpen } from '@/redux/slices/navbar';
import { setIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getLoginNavigationUrl,
  getMyCoursesNavigationUrl,
  getNotesNavigationUrl,
  getNotificationSettingsNavigationUrl,
  getProfileNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

interface ProfileAvatarButtonProps {
  isPopoverPortalled?: boolean;
}

const ProfileAvatarButton: React.FC<ProfileAvatarButtonProps> = ({ isPopoverPortalled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const isUserLoggedIn = isLoggedIn();
  // useLogout centralizes analytics (via eventName), auth teardown, and redirect logic.
  const logout = useLogout();

  const onTriggerClicked = () => {
    dispatch({ type: setIsSidebarNavigationVisible.type, payload: false });
    if (!isUserLoggedIn) {
      logButtonClick('profile_avatar_login');
    }
  };

  const onLogoutClicked = async () => logout({ eventName: 'profile_avatar_logout' });

  const onProfileClicked = () => {
    logButtonClick('profile_avatar_profile');
    router.push(getProfileNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  const onMyQuranClicked = () => {
    logButtonClick('profile_avatar_my_quran');
    router.push(getProfileNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  const onNotificationSettingsClicked = () => {
    logButtonClick('profile_avatar_notification_settings');
    router.push(getNotificationSettingsNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  const onReadingHistoryClicked = () => {
    logButtonClick('profile_avatar_reading_history');
    router.push(getReadingGoalProgressNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  const onNotesClicked = () => {
    logButtonClick('profile_avatar_notes');
    router.push(getNotesNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  const onMyCoursesClicked = () => {
    logButtonClick('profile_avatar_my_courses');
    router.push(getMyCoursesNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  if (isUserLoggedIn) {
    return (
      <PopoverMenu
        isModal={false}
        isPortalled={isPopoverPortalled}
        trigger={
          <Button
            tooltip={t('profile')}
            ariaLabel={t('profile')}
            variant={ButtonVariant.Ghost}
            href={null}
            shape={ButtonShape.Circle}
            onClick={onTriggerClicked}
            shouldFlipOnRTL={false}
          >
            <IconPerson />
          </Button>
        }
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverMenu.Item onClick={onProfileClicked} icon={<IconPerson />}>
          {t('profile')}
        </PopoverMenu.Item>
        <PopoverMenu.Item
          onClick={onMyQuranClicked}
          icon={<IconContainer icon={<BookmarkIcon />} color={IconColor.accent} />}
        >
          {t('my-quran')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onNotificationSettingsClicked} icon={<NotificationBellIcon />}>
          {t('notification-settings')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onReadingHistoryClicked} icon={<ClockIcon />}>
          {t('reading-history')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onNotesClicked} icon={<NotesIcon />}>
          {t('notes.title')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onMyCoursesClicked} icon={<ReaderIcon />}>
          {t('my-learning-plans')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onLogoutClicked} icon={<LogoutIcon />}>
          {t('logout')}
        </PopoverMenu.Item>
      </PopoverMenu>
    );
  }

  return (
    <Button
      tooltip={t('sign-in')}
      ariaLabel={t('sign-in')}
      variant={ButtonVariant.SimplifiedAccent}
      size={ButtonSize.Small}
      href={getLoginNavigationUrl(router.asPath)}
      onClick={() => {
        dispatch({ type: setIsNavigationDrawerOpen.type, payload: false });
        onTriggerClicked();
      }}
      id="login-button"
      className={styles.loginButton}
    >
      {t('sign-in')}
    </Button>
  );
};

export default ProfileAvatarButton;
