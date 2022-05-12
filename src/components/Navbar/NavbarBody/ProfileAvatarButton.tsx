import useTranslation from 'next-translate/useTranslation';

import ArrowIcon from '../../../../public/icons/east.svg';
import LogoutIcon from '../../../../public/icons/logout.svg';
import IconPerson from '../../../../public/icons/person.svg';

import styles from './NavbarBody.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

const ProfileAvatarButton = () => {
  const { t } = useTranslation('common');

  const isLoggedIn = true; // TODO: integrate to auth

  const trigger = (
    <Button
      className={styles.avatarButton}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      //   size={ButtonSize.Small}
    >
      <IconPerson />
    </Button>
  );

  if (isLoggedIn) {
    return (
      <PopoverMenu trigger={trigger}>
        <PopoverMenu.Item icon={<ArrowIcon />}>{t('profile')}</PopoverMenu.Item>
        <PopoverMenu.Item icon={<LogoutIcon />}>{t('logout')}</PopoverMenu.Item>
      </PopoverMenu>
    );
  }

  return trigger;
};

export default ProfileAvatarButton;
