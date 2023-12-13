import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './ProfileAvatarButton.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ClockIcon from '@/icons/clock.svg';
import ArrowIcon from '@/icons/east.svg';
import LogoutIcon from '@/icons/logout.svg';
import IconPerson from '@/icons/person.svg';
import TickIcon from '@/icons/tick.svg';
import { logoutUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { logButtonClick } from '@/utils/eventLogger';
import { getReadingGoalProgressNavigationUrl } from '@/utils/navigation';

const ProfileAvatarButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  const isUserLoggedIn = isLoggedIn();

  const onTriggerClicked = () => {
    if (!isUserLoggedIn) {
      logButtonClick('profile_avatar_login');
    }
  };

  const onLogoutClicked = async () => {
    logButtonClick('profile_avatar_logout');

    await logoutUser();
    removeLastSyncAt();
    router.reload();
  };

  const onProfileClicked = () => {
    logButtonClick('profile_avatar_profile');
    router.push('/profile').then(() => {
      setIsOpen(false);
    });
  };

  const onReadingHistoryClicked = () => {
    logButtonClick('profile_avatar_reading_history');
    router.push(getReadingGoalProgressNavigationUrl()).then(() => {
      setIsOpen(false);
    });
  };

  if (isUserLoggedIn) {
    return (
      <PopoverMenu
        isModal={false}
        trigger={
          <Button
            tooltip={t('profile')}
            ariaLabel={t('profile')}
            variant={ButtonVariant.Ghost}
            href={null}
            shape={ButtonShape.Circle}
            onClick={onTriggerClicked}
            className={styles.loggedIn}
            shouldFlipOnRTL={false}
          >
            <TickIcon />
            <IconPerson />
          </Button>
        }
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverMenu.Item onClick={onProfileClicked} icon={<ArrowIcon />}>
          {t('profile')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onReadingHistoryClicked} icon={<ClockIcon />}>
          {t('reading-history')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onLogoutClicked} icon={<LogoutIcon />}>
          {t('logout')}
        </PopoverMenu.Item>
      </PopoverMenu>
    );
  }

  return (
    <Button
      tooltip={t('login')}
      ariaLabel={t('login')}
      variant={ButtonVariant.Ghost}
      href="/login"
      shape={ButtonShape.Circle}
      onClick={onTriggerClicked}
    >
      <IconPerson />
    </Button>
  );
};

export default ProfileAvatarButton;
