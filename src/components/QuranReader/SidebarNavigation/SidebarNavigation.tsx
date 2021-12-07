/* eslint-disable max-lines */
import { useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import IconClose from '../../../../public/icons/close.svg';

import styles from './SidebarNavigation.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Switch from 'src/components/dls/Switch/Switch';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import {
  navigationItems,
  selectIsSidebarNavigationVisible,
  selectNavigationItem,
  selectSelectedNavigationItem,
  NavigationItem,
  setIsVisible,
} from 'src/redux/slices/QuranReader/sidebarNavigation';

const JuzSelection = dynamic(() => import('./JuzSelection'));
const PageSelection = dynamic(() => import('./PageSelection'));
const SurahSelection = dynamic(() => import('./SurahSelection'));

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
      dispatch(setIsVisible(false));
    },
    true,
    768,
  );

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
              dispatch(selectNavigationItem(value));
            }}
          />
        </div>
        <Button
          tooltip={t('close')}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          onClick={() => {
            dispatch(setIsVisible(false));
          }}
        >
          <IconClose />
        </Button>
      </div>
      <div className={styles.contentContainer}>
        {selectedNavigationItem === NavigationItem.Surah && <SurahSelection />}
        {selectedNavigationItem === NavigationItem.Juz && <JuzSelection />}
        {selectedNavigationItem === NavigationItem.Page && <PageSelection />}
      </div>
    </div>
  );
};

export default SidebarNavigation;
