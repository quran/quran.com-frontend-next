/* eslint-disable react/no-multi-comp */
import {
  ToastContainer as PrimitiveToastContainer,
  toast as primitiveToast,
  cssTransition,
} from 'react-toastify';

import styles from './Toast.module.scss';

import Button from 'src/components/dls/Button/Button';

const CloseButton = ({ closeToast }) => (
  <div className={styles.closeButton}>
    <Button onClick={closeToast}>Close</Button>
  </div>
);

type Options = {
  withCloseButton?: boolean;
  preserve?: boolean;
};
const TOAST_DELAY = 3000; // 3 second
export const toast = (content: React.ReactNode, options: Options = {}) => {
  primitiveToast(content, {
    autoClose: options.preserve ? false : TOAST_DELAY,
    closeButton: options.withCloseButton ? CloseButton : false,
  });
};
export const ToastContainer = () => {
  return (
    <PrimitiveToastContainer
      transition={cssTransition({
        enter: `${styles.animate} ${styles.enter}`,
        exit: `${styles.animate} ${styles.exit}`,
      })}
      className={styles.toastContainer}
      bodyClassName={styles.toastBody}
      toastClassName={styles.toast}
      position="bottom-right"
      hideProgressBar
      draggableDirection="y"
    />
  );
};
