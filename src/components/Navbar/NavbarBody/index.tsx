/* eslint-disable max-lines */
import { memo, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import SettingsDrawer from '../SettingsDrawer/SettingsDrawer';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import Banner from '@/components/Banner/Banner';
import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import NavigationDrawer from '@/components/Navbar/NavigationDrawer/NavigationDrawer';
import SearchDrawer from '@/components/Navbar/SearchDrawer/SearchDrawer';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import {
  selectIsNavigationDrawerOpen,
  selectIsSettingsDrawerOpen,
  setDisableSearchDrawerTransition,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
} from '@/redux/slices/navbar';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import {
  selectIsSidebarNavigationVisible,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { TestId } from '@/tests/test-ids';
import { getSidebarTransitionDurationFromCss } from '@/utils/css';
import { logEvent } from '@/utils/eventLogger';

const SidebarNavigation = dynamic(
  () => import('@/components/QuranReader/SidebarNavigation/SidebarNavigation'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

/**
 * Log drawer events.
 *
 * @param {string} drawerName
 */
const logDrawerOpenEvent = (drawerName: string) => {
  // eslint-disable-next-line i18next/no-literal-string
  logEvent(`drawer_${drawerName}_open`);
};

interface Props {
  isBannerVisible: boolean;
}

const QURAN_READER_ROUTES = new Set([
  '/[chapterId]',
  '/[chapterId]/[verseId]',
  '/hizb/[hizbId]',
  '/juz/[juzId]',
  '/page/[pageId]',
  '/rub/[rubId]',
]);

interface Props {
  isBannerVisible: boolean;
}

const NavbarBody: React.FC<Props> = ({ isBannerVisible }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const { isLoggedIn } = useIsLoggedIn();
  const router = useRouter();
  const isQuranReaderRoute = QURAN_READER_ROUTES.has(router.pathname);
  const normalizedPathname = router.asPath.split(/[?#]/)[0];
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const isPersistHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const hasResetSidebarAfterHydration = useRef(false);
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);
  const sidebarVisibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSidebarVisibilityRef = useRef(isSidebarNavigationVisible);
  const wasSidebarVisible = previousSidebarVisibilityRef.current;
  const isTransitioningToClose = wasSidebarVisible && !isSidebarNavigationVisible;
  const sidebarTransitionDuration = getSidebarTransitionDurationFromCss();

  useEffect(() => {
    if (isQuranReaderRoute) return;
    // Disable the sidebar when not on any Quran reader route
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isQuranReaderRoute, normalizedPathname]);

  // Determine whether to render the SidebarNavigation component.
  // We keep it mounted during transitions to allow smooth CSS animations.
  // Conditions:
  // 1. isQuranReaderRoute: Always render on Quran reader pages (even if sidebar is hidden)
  // 2. isSidebarNavigationVisible: Render when sidebar is actively visible
  // 3. isSidebarClosing: Keep mounted during closing animation (timeout-based state)
  // 4. isTransitioningToClose: Keep mounted during initial transition from visible to hidden (ref-based detection)
  const shouldRenderSidebarNavigation =
    isQuranReaderRoute || isSidebarNavigationVisible || isSidebarClosing || isTransitioningToClose;

  // Manage sidebar closing animation timing.
  // When sidebar becomes visible: cancel any pending close timeout
  // When sidebar starts closing: set isSidebarClosing state and schedule its cleanup after transition duration
  // This keeps the component mounted during CSS transitions, then unmounts it cleanly.
  useEffect(() => {
    if (isSidebarNavigationVisible) {
      setIsSidebarClosing(false);
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    } else if (previousSidebarVisibilityRef.current) {
      setIsSidebarClosing(true);
      sidebarVisibilityTimeoutRef.current = setTimeout(() => {
        setIsSidebarClosing(false);
        sidebarVisibilityTimeoutRef.current = null;
      }, sidebarTransitionDuration);
    }

    previousSidebarVisibilityRef.current = isSidebarNavigationVisible;

    return () => {
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    };
  }, [isSidebarNavigationVisible, sidebarTransitionDuration]);

  useEffect(() => {
    if (hasResetSidebarAfterHydration.current) return;
    if (!isPersistHydrationComplete) return;
    hasResetSidebarAfterHydration.current = true;
    if (isQuranReaderRoute) return;
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isPersistHydrationComplete, isQuranReaderRoute]);

  const openNavigationDrawer = () => {
    logDrawerOpenEvent('navigation');
    dispatch(setIsNavigationDrawerOpen(true));
  };

  const openSearchDrawer = () => {
    logDrawerOpenEvent('search');
    dispatch(setIsSearchDrawerOpen(true));
    // reset the disable transition state
    dispatch(setDisableSearchDrawerTransition(false));
  };

  const bannerProps = {
    text: t('stay-on-track'),
    ctaButtonText: t('create-my-goal'),
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
            <SearchDrawer />

            {shouldRenderSidebarNavigation && <SidebarNavigation />}
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
            <SettingsDrawer />
            <NavigationDrawer />
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(NavbarBody);
