import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './MobileStickyItemsBar.module.scss';

import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import ProfileAvatarButton from '@/components/Navbar/NavbarBody/ProfileAvatarButton';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useNavbarDrawerActions from '@/hooks/useNavbarDrawerActions';
import useShowOnScrollUp from '@/hooks/useShowOnScrollUp';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import { selectIsNavigationDrawerOpen, selectIsSettingsDrawerOpen } from '@/redux/slices/navbar';

const MobileStickyItemsBar = () => {
  const { t } = useTranslation('common');
  const { isLoggedIn } = useIsLoggedIn();
  const isNavDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isDrawerOpen = isNavDrawerOpen || isSettingsDrawerOpen;
  // Custom thresholds for mobile sticky bar:
  // - topThreshold: 100px (don't show until scrolled past navbar area)
  // - scrollDistance: 50px (default sensitivity for scroll-up detection)
  // - hideThreshold: 200px (hide early for clean handoff to full navbar)
  const { show, nearTop } = useShowOnScrollUp(100, 50, 200);
  const isVisible = show && !nearTop;
  const { openSearchDrawer, openNavigationDrawer } = useNavbarDrawerActions();

  return (
    <div
      className={classNames(styles.container, styles[isVisible ? 'visible' : 'hidden'], {
        [styles.dimmed]: isDrawerOpen,
      })}
      inert={isDrawerOpen || undefined}
    >
      <div className={styles.centerVertically}>
        <div className={styles.leftCTA}>
          <NavbarLogoWrapper />
        </div>
      </div>
      <div className={styles.centerVertically}>
        <div className={styles.rightCTA}>
          {!isLoggedIn && <ProfileAvatarButton isPopoverPortalled={false} />}
          <Button
            tooltip={t('search.title')}
            ariaLabel={t('search.title')}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            shouldFlipOnRTL={false}
            onClick={openSearchDrawer}
          >
            <IconSearch />
          </Button>
          {isLoggedIn && <ProfileAvatarButton isPopoverPortalled={false} />}
          <Button
            tooltip={t('menu')}
            ariaLabel={t('aria.nav-drawer-open')}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            onClick={openNavigationDrawer}
          >
            <IconMenu />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyItemsBar;
