/* eslint-disable react/no-multi-comp */
import { useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import SidebarNavigationSelections from './SidebarNavigationSelections';

import RevelationOrderNavigationNotice, {
  RevelationOrderNavigationNoticeView,
} from '@/components/QuranReader/RevelationOrderNavigationNotice';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import KeyboardInput from '@/dls/KeyboardInput';
import Switch from '@/dls/Switch/Switch';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import IconClose from '@/icons/close.svg';
import { selectNavbar } from '@/redux/slices/navbar';
import {
  NavigationItem,
  selectIsSidebarNavigationVisible,
  selectNavigationItem,
  selectSelectedNavigationItem,
  setIsVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { logButtonClick, logEvent, logValueChange } from '@/utils/eventLogger';
import { isMobile } from '@/utils/responsive';

const SidebarNavigation = () => {
  const isSidebarVisible = useSelector(selectIsSidebarNavigationVisible);
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const selectedNavigationItem = useSelector(selectSelectedNavigationItem);
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const sidebarRef = useRef();

  useOutsideClickDetector(
    sidebarRef,
    () => {
      logEvent('sidebar_navigation_close_outside_click');
      dispatch(setIsVisible(false));
    },
    isSidebarVisible && isMobile(),
  );

  const navigationItems = [
    {
      name: t('surah'),
      value: NavigationItem.Surah,
    },
    {
      name: t('juz'),
      value: NavigationItem.Juz,
    },
    // {
    //   name: t('hizb'),
    //   value: NavigationItem.Hizb,
    // },
    {
      name: t('page'),
      value: NavigationItem.Page,
    },
  ];

  const isSidebarAuto = isSidebarVisible === 'auto';
  const showSidebar = isSidebarVisible === true;

  return (
    <div
      ref={sidebarRef}
      className={classNames(styles.container, {
        [styles.visibleContainer]: showSidebar && isNavbarVisible,
        [styles.visibleContainerCollapsed]: showSidebar && !isNavbarVisible,
        [styles.containerAuto]: isSidebarAuto && isNavbarVisible,
        [styles.containerAutoCollapsed]: isSidebarAuto && !isNavbarVisible,
        [styles.inVisibleContainer]: isNavbarVisible,
        [styles.inVisibleContainerCollapsed]: !isNavbarVisible,
        [styles.spaceOnTop]: isSidebarVisible && isNavbarVisible,
        [styles.spaceOnTopCollapsed]: isSidebarVisible && !isNavbarVisible,
      })}
    >
      {!isReadingByRevelationOrder ? (
        // Default ordering
        <>
          <div className={styles.header}>
            <div className={styles.switchContainer}>
              <Switch
                items={navigationItems}
                selected={selectedNavigationItem}
                onSelect={(value) => {
                  logValueChange('sidebar_navigation_view', selectedNavigationItem, value);
                  dispatch(selectNavigationItem(value as NavigationItem));
                }}
              />
            </div>
            <Button
              tooltip={t('close')}
              shape={ButtonShape.Circle}
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              onClick={() => {
                logButtonClick('sidebar_navigation_close');
                dispatch(setIsVisible(false));
              }}
              ariaLabel={t('aria.sidebar-nav-close')}
            >
              <IconClose />
            </Button>
          </div>
          <p className={styles.tip}>
            <span>{t('sidebar.try-navigating-with')}</span>
            <KeyboardInput meta keyboardKey="K" />
          </p>

          <div className={styles.contentContainer}>
            <SidebarNavigationSelections
              isVisible={isSidebarVisible}
              selectedNavigationItem={selectedNavigationItem}
            />
          </div>
        </>
      ) : (
        // Revelation ordering
        <>
          <div className={styles.revelationOrderHeader}>
            <Button
              tooltip={t('close')}
              shape={ButtonShape.Circle}
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              onClick={() => {
                logButtonClick('sidebar_navigation_close');
                dispatch(setIsVisible(false));
              }}
              ariaLabel={t('aria.sidebar-nav-close')}
            >
              <IconClose />
            </Button>
          </div>
          <RevelationOrderNavigationNotice view={RevelationOrderNavigationNoticeView.SideDrawer} />
          <SidebarNavigationSelections
            isVisible={isSidebarVisible}
            selectedNavigationItem={NavigationItem.Surah}
          />{' '}
        </>
      )}
    </div>
  );
};

export default SidebarNavigation;
