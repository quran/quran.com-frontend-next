/* eslint-disable max-lines */
import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ProfileAvatarButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useLogout from '@/hooks/auth/useLogout';
import BookmarkFilledIcon from '@/icons/bookmark_filled.svg';
import ClockIcon from '@/icons/clock.svg';
import ReaderIcon from '@/icons/learning-plan.svg';
import LogoutIcon from '@/icons/logout.svg';
import NotesIcon from '@/icons/notes-with-pencil.svg';
import NotificationBellIcon from '@/icons/notification-bell.svg';
import IconPerson from '@/icons/person.svg';
import { setIsNavigationDrawerOpen } from '@/redux/slices/navbar';
import { setIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { TestId } from '@/tests/test-ids';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getLoginNavigationUrl,
  getMyCoursesNavigationUrl,
  getMyQuranNavigationUrl,
  getNotesNavigationUrl,
  getNotificationSettingsNavigationUrl,
  getProfileNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

const MENU_ITEMS = [
  {
    eventName: 'profile_avatar_profile',
    navigationUrl: getProfileNavigationUrl(),
    translationKey: 'profile',
    icon: <IconPerson />,
  },
  {
    eventName: 'profile_avatar_my_quran',
    navigationUrl: getMyQuranNavigationUrl(),
    translationKey: 'my-quran',
    icon: <BookmarkFilledIcon className={styles.bookmarkIcon} />,
  },
  {
    eventName: 'profile_avatar_notification_settings',
    navigationUrl: getNotificationSettingsNavigationUrl(),
    translationKey: 'notification-settings',
    icon: <NotificationBellIcon />,
  },
  {
    eventName: 'profile_avatar_reading_history',
    navigationUrl: getReadingGoalProgressNavigationUrl(),
    translationKey: 'reading-history',
    icon: <ClockIcon />,
  },
  {
    eventName: 'profile_avatar_notes',
    navigationUrl: getNotesNavigationUrl(),
    translationKey: 'notes.title',
    icon: <NotesIcon />,
  },
  {
    eventName: 'profile_avatar_my_courses',
    navigationUrl: getMyCoursesNavigationUrl(),
    translationKey: 'my-learning-plans',
    icon: <ReaderIcon />,
  },
];

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

  const createNavigationHandler =
    (eventName: string, navigationUrl: string): (() => void) =>
    () => {
      logButtonClick(eventName);
      router.push(navigationUrl).then(() => setIsOpen(false));
    };

  // logging performed in onTriggerClicked
  const onLoginButtonClicked = () => {
    dispatch({ type: setIsNavigationDrawerOpen.type, payload: false });
    onTriggerClicked();
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
            data-testid="profile-avatar-button"
          >
            <IconPerson />
          </Button>
        }
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {MENU_ITEMS.map((menu) => (
          <PopoverMenu.Item
            key={menu.eventName}
            onClick={createNavigationHandler(menu.eventName, menu.navigationUrl)}
            icon={menu.icon}
          >
            {t(menu.translationKey)}
          </PopoverMenu.Item>
        ))}
        <PopoverMenu.Item
          onClick={onLogoutClicked}
          icon={<LogoutIcon />}
          dataTestId={TestId.LOGOUT_BUTTON}
        >
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
      onClick={onLoginButtonClicked}
      id="login-button"
      className={styles.loginButton}
    >
      {t('sign-in')}
    </Button>
  );
};

export default ProfileAvatarButton;
