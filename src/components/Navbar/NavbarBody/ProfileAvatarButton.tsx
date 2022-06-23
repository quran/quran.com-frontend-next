import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import ArrowIcon from '../../../../public/icons/east.svg';
import LogoutIcon from '../../../../public/icons/logout.svg';
import IconPerson from '../../../../public/icons/person.svg';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { logoutUser } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';

const ProfileAvatarButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  const isUserLoggedIn = isLoggedIn();

  const trigger = (
    <Button
      tooltip={isUserLoggedIn ? null : t('login')}
      variant={ButtonVariant.Ghost}
      href={isUserLoggedIn ? null : '/login'}
      shape={ButtonShape.Circle}
    >
      <IconPerson />
    </Button>
  );

  const onLogoutClicked = () => {
    logoutUser().then(() => {
      router.reload();
    });
  };

  const onProfileClicked = () => {
    router.push('/profile').then(() => {
      setIsOpen(false);
    });
  };
  if (isUserLoggedIn) {
    return (
      <PopoverMenu trigger={trigger} isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverMenu.Item onClick={onProfileClicked} icon={<ArrowIcon />}>
          {t('profile')}
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
