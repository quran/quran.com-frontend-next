/* eslint-disable react/no-multi-comp */
import { useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import IconClose from '../../../../public/icons/close.svg';

import styles from './SidebarNavigation.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import KeyboardInput from 'src/components/dls/KeyboardInput';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Switch from 'src/components/dls/Switch/Switch';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import {
  selectIsSidebarNavigationVisible,
  selectNavigationItem,
  selectSelectedNavigationItem,
  NavigationItem,
  setIsVisible,
} from 'src/redux/slices/QuranReader/sidebarNavigation';
import { logButtonClick, logEvent, logValueChange } from 'src/utils/eventLogger';

const Loading = () => (
  <div className={styles.loadingContainer}>
    <Spinner />
  </div>
);

const PageSelection = dynamic(() => import('./PageSelection'), {
  loading: Loading,
});
const SurahSelection = dynamic(() => import('./SurahSelection'), {
  loading: Loading,
});
const JuzSelection = dynamic(() => import('./JuzSelection'), {
  loading: Loading,
});

const SidebarNavigation = () => {
  const { isExpanded: isContextMenuExpanded } = useSelector(selectContextMenu, shallowEqual);
  const isVisible = useSelector(selectIsSidebarNavigationVisible);
  const selectedNavigationItem = useSelector(selectSelectedNavigationItem);
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const sidebarRef = useRef();

  useOutsideClickDetector(
    sidebarRef,
    () => {
      logEvent('sidebar_navigation_close_outside_click');
      dispatch(setIsVisible(false));
    },
    isMobile(),
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
    {
      name: t('page'),
      value: NavigationItem.Page,
    },
  ];

  return (
    <div
      ref={sidebarRef}
      className={classNames(styles.container, {
        [styles.visibleContainer]: isVisible,
        [styles.spaceOnTop]: isContextMenuExpanded,
      })}
    >
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
        >
          <IconClose />
        </Button>
      </div>
      <p className={styles.tip}>
        <span>{t('sidebar.try-navigating-with')}</span>
        <KeyboardInput meta keyboardKey="K" />
      </p>
      <div className={styles.contentContainer}>
        {selectedNavigationItem === NavigationItem.Surah && <SurahSelection />}
        {selectedNavigationItem === NavigationItem.Juz && <JuzSelection />}
        {selectedNavigationItem === NavigationItem.Page && <PageSelection />}
      </div>
    </div>
  );
};

const TABLET_WIDTH = 768;
const isMobile = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.clientWidth < TABLET_WIDTH;
};

export default SidebarNavigation;
