import { useState } from 'react';

import Cookies from 'js-cookie';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import ArrowIcon from '../../../../public/icons/east.svg';
import LogoutIcon from '../../../../public/icons/logout.svg';
import IconPerson from '../../../../public/icons/person.svg';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { removeLastSyncAt } from 'src/redux/slices/Auth/userDataSync';
import { logoutUser } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';

const shouldShowButton = () => {
  const allowedPercentageOfUsers = Number(process.env.NEXT_PUBLIC_SHOW_LOGIN_BUTTON_THRESHOLD);
  // eslint-disable-next-line i18next/no-literal-string
  const cookiesKey = `${allowedPercentageOfUsers}-show-login-button`;
  if (Cookies.get(cookiesKey) === 'true') {
    return true;
  }
  const randomNumber = Math.floor(Math.random() * (100 - 1) + 1);
  if (randomNumber <= allowedPercentageOfUsers) {
    Cookies.set(cookiesKey, 'true');
    return true;
  }
  Cookies.set(cookiesKey, 'false');
  return false;
};

const ProfileAvatarButton = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  if (!shouldShowButton()) {
    return <></>;
  }

  const isUserLoggedIn = isLoggedIn();

  const trigger = (
    <Button
      tooltip={isUserLoggedIn ? t('profile') : t('login')}
      variant={ButtonVariant.Ghost}
      href={isUserLoggedIn ? null : '/login'}
      shape={ButtonShape.Circle}
    >
      <IconPerson />
    </Button>
  );

  const onLogoutClicked = () => {
    logoutUser().then(() => {
      dispatch({ type: removeLastSyncAt.type });
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
