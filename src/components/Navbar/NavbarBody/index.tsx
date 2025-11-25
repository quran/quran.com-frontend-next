/* eslint-disable max-lines */
import { memo, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import LanguageSelector from '@/components/Navbar/LanguageSelector';
import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import NavigationDrawer from '@/components/Navbar/NavigationDrawer/NavigationDrawer';
import SearchDrawer from '@/components/Navbar/SearchDrawer/SearchDrawer';
import SettingsDrawer from '@/components/Navbar/SettingsDrawer/SettingsDrawer';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import IconSettings from '@/icons/settings.svg';
import {
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
  setDisableSearchDrawerTransition,
} from '@/redux/slices/navbar';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import {
  selectIsSidebarNavigationVisible,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
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

const QURAN_READER_ROUTES = new Set([
  '/[chapterId]',
  '/[chapterId]/[verseId]',
  '/hizb/[hizbId]',
  '/juz/[juzId]',
  '/page/[pageId]',
  '/rub/[rubId]',
]);

const SIDEBAR_TRANSITION_DURATION_MS = 400; // Keep in sync with --transition-regular (src/styles/theme.scss)

const NavbarBody: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
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

  useEffect(() => {
    if (isQuranReaderRoute) return;
    // Disable the sidebar when not on any Quran reader route
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isQuranReaderRoute, normalizedPathname]);

  const shouldRenderSidebarNavigation =
    isQuranReaderRoute || isSidebarNavigationVisible || isSidebarClosing || isTransitioningToClose;

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
      }, SIDEBAR_TRANSITION_DURATION_MS);
    }

    previousSidebarVisibilityRef.current = isSidebarNavigationVisible;

    return () => {
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    };
  }, [isSidebarNavigationVisible]);

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

  const openSettingsDrawer = () => {
    logDrawerOpenEvent('settings');
    dispatch({ type: setIsSettingsDrawerOpen.type, payload: true });
  };

  return (
    <div className={styles.itemsContainer}>
      <div className={styles.centerVertically}>
        <div className={styles.leftCTA}>
          <>
            <Button
              tooltip={t('menu')}
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={openNavigationDrawer}
              ariaLabel={t('aria.nav-drawer-open')}
            >
              <IconMenu />
            </Button>
            <NavigationDrawer />
          </>
          <NavbarLogoWrapper />
        </div>
      </div>
      <div className={styles.centerVertically}>
        <div className={styles.rightCTA}>
          <>
            <ProfileAvatarButton />
            <LanguageSelector />
            <Button
              tooltip={t('settings.title')}
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={openSettingsDrawer}
              ariaLabel={t('aria.change-settings')}
              id="settings-button"
            >
              <IconSettings />
            </Button>
            <SettingsDrawer />
          </>
          <>
            <Button
              tooltip={t('search.title')}
              variant={ButtonVariant.Ghost}
              onClick={openSearchDrawer}
              shape={ButtonShape.Circle}
              shouldFlipOnRTL={false}
              ariaLabel={t('search.title')}
            >
              <IconSearch />
            </Button>
            <SearchDrawer />

            {shouldRenderSidebarNavigation && <SidebarNavigation />}

            <SettingsDrawer />
          </>
        </div>
      </div>
    </div>
  );
};

export default memo(NavbarBody);
