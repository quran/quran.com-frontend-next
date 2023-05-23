import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ClockIcon from '@/icons/clock.svg';
import ArrowIcon from '@/icons/east.svg';
import LogoutIcon from '@/icons/logout.svg';
import IconPerson from '@/icons/person.svg';
import { removeLastSyncAt } from '@/redux/slices/Auth/userDataSync';
import { logoutUser } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getReadingGoalProgressNavigationUrl } from '@/utils/navigation';

const ProfileAvatarButton = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  const isUserLoggedIn = isLoggedIn();

  const onTriggerClicked = () => {
    if (!isUserLoggedIn) {
      logButtonClick('profile_avatar_login');
    }
  };

  const trigger = (
    <Button
      tooltip={isUserLoggedIn ? t('profile') : t('login')}
      ariaLabel={isUserLoggedIn ? t('profile') : t('login')}
      variant={ButtonVariant.Ghost}
      href={isUserLoggedIn ? null : '/login'}
      shape={ButtonShape.Circle}
      onClick={onTriggerClicked}
    >
      <IconPerson />
    </Button>
  );

  const onLogoutClicked = () => {
    logButtonClick('profile_avatar_logout');
    logoutUser().then(() => {
      dispatch({ type: removeLastSyncAt.type });
      router.reload();
    });
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
      <PopoverMenu trigger={trigger} isOpen={isOpen} onOpenChange={setIsOpen}>
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

  return trigger;
};

export default ProfileAvatarButton;
