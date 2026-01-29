import { memo } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import Banner from '@/components/Banner/Banner';
import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useNavbarDrawerActions from '@/hooks/useNavbarDrawerActions';
import useSidebarNavigation from '@/hooks/useSidebarNavigation';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import { selectIsNavigationDrawerOpen, selectIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { TestId } from '@/tests/test-ids';

const SidebarNavigation = dynamic(
  () => import('@/components/QuranReader/SidebarNavigation/SidebarNavigation'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

interface Props {
  isBannerVisible: boolean;
}

const NavbarBody: React.FC<Props> = ({ isBannerVisible }) => {
  const { t } = useTranslation('common');
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const { isLoggedIn } = useIsLoggedIn();
  const { shouldRenderSidebar } = useSidebarNavigation();
  const { openSearchDrawer, openNavigationDrawer } = useNavbarDrawerActions();

  const bannerProps = {
    text: t('join-ramadan-challenge'),
    ctaButtonText: t('learn-more'),
  };

  return (
    <>
      {isBannerVisible && (
        <div
          className={classNames(styles.bannerContainerTop, {
            [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen,
          })}
        >
          <Banner {...bannerProps} />
        </div>
      )}
      <div
        className={classNames(styles.itemsContainer, {
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen,
        })}
        inert={isNavigationDrawerOpen || isSettingsDrawerOpen || undefined}
      >
        <div className={styles.centerVertically}>
          <div className={styles.leftCTA}>
            <NavbarLogoWrapper />
          </div>
        </div>
        {isBannerVisible && (
          <div className={styles.bannerContainerCenter}>
            <Banner {...bannerProps} />
          </div>
        )}
        <div className={styles.centerVertically}>
          <div className={styles.rightCTA}>
            {!isLoggedIn && <ProfileAvatarButton />}
            <Button
              tooltip={t('search.title')}
              variant={ButtonVariant.Ghost}
              onClick={openSearchDrawer}
              shape={ButtonShape.Circle}
              shouldFlipOnRTL={false}
              ariaLabel={t('search.title')}
              data-testid="open-search-drawer"
            >
              <IconSearch />
            </Button>

            {shouldRenderSidebar && <SidebarNavigation />}
            {isLoggedIn && <ProfileAvatarButton />}

            <Button
              tooltip={t('menu')}
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={openNavigationDrawer}
              ariaLabel={t('aria.nav-drawer-open')}
              data-testid={TestId.OPEN_NAVIGATION_DRAWER}
            >
              <IconMenu />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(NavbarBody);
