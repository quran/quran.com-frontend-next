import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectNavbar, setIsSettingsDrawerOpen } from 'src/redux/slices/navbar';
import { useCallback, useRef, useEffect } from 'react';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import IconClose from '../../../../public/icons/close.svg';
import styles from './SettingsDrawer.module.scss';
import SettingsBody from './SettingsBody';

const SettingsDrawer = () => {
  const drawerRef = useRef(null);
  const isOpen = useSelector(selectNavbar).isSettingsDrawerOpen;
  const dispatch = useDispatch();
  const isEscapeKeyPressed = useKeyPressedDetector('Escape', isOpen);

  const closeSettingsDrawer = useCallback(() => {
    dispatch({ type: setIsSettingsDrawerOpen, payload: false });
  }, [dispatch]);

  // listen to any changes of escape key being pressed.
  useEffect(() => {
    // if we allow closing the modal by keyboard and also ESCAPE key has been pressed, we close the modal.
    if (isEscapeKeyPressed === true) {
      closeSettingsDrawer();
    }
  }, [closeSettingsDrawer, isEscapeKeyPressed]);

  useOutsideClickDetector(drawerRef, closeSettingsDrawer, isOpen);

  return (
    <div
      className={classNames(styles.container, { [styles.containerOpen]: isOpen })}
      ref={drawerRef}
    >
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>Settings</div>
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={closeSettingsDrawer}
            >
              <IconClose />
            </Button>
          </div>
        </div>
      </div>
      <SettingsBody />
    </div>
  );
};

export default SettingsDrawer;
