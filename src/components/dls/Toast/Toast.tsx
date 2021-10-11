/* eslint-disable react/no-multi-comp */
import {
  ToastContainer as PrimitiveToastContainer,
  toast as primitiveToast,
  Slide,
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
};
export const toast = (content: React.ReactNode, options: Options = {}) => {
  primitiveToast(content, {
    autoClose: false,
    closeButton: options.withCloseButton ? CloseButton : false,
  });
};
export const ToastContainer = () => {
  return (
    <PrimitiveToastContainer
      transition={Slide}
      className={styles.toastContainer}
      bodyClassName={styles.toastBody}
      toastClassName={styles.toast}
      position="bottom-right"
      hideProgressBar
    />
  );
};
