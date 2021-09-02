import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectNavbar, setIsSettingsDrawerOpen } from 'src/redux/slices/navbar';
import SettingsIcon from '../../../../public/icons/settings.svg';
import IconClose from '../../../../public/icons/close.svg';
import styles from './SettingsDrawer.module.scss';
import SettingsBody from './SettingsBody';

const SettingsDrawer = () => {
  const isOpen = useSelector(selectNavbar).isSettingsDrawerOpen;
  const dispatch = useDispatch();

  const closeSearchDrawer = () => {
    dispatch({ type: setIsSettingsDrawerOpen, payload: false });
  };

  return (
    <div className={classNames(styles.container, { [styles.containerOpen]: isOpen })}>
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
            <Button shape={ButtonShape.Circle} variant={ButtonVariant.Ghost}>
              <SettingsIcon />
            </Button>
            <Button
              tooltip="Close"
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={closeSearchDrawer}
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
