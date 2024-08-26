/* eslint-disable react/no-multi-comp */
import { useCallback, useContext } from 'react';

import classNames from 'classnames';
import {
  ToastContainer as PrimitiveToastContainer,
  toast as primitiveToast,
  cssTransition,
} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import styles from './Toast.module.scss';
import ToastContext from './ToastContext';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';

export enum ToastStatus {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}
type Action = {
  text: string;
  onClick?: () => void;
  primary?: boolean;
};
type Options = {
  preserve?: boolean;
  actions?: Action[];
  status?: ToastStatus;
};
const TOAST_DURATION = 3000; // 3 second
const toast = (content: React.ReactNode, options: Options = {}) => {
  const toastId = primitiveToast(
    <div className={styles.contentContainer}>
      {content}
      {options.actions && (
        <div className={styles.actionsContainer}>
          {options.actions.map((action, index) => (
            <Button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type={action.primary ? ButtonType.Primary : ButtonType.Secondary}
              className={styles.action}
              size={ButtonSize.Small}
              onClick={() => {
                primitiveToast.dismiss(toastId);
                action.onClick?.();
              }}
            >
              {action.text}
            </Button>
          ))}
        </div>
      )}
    </div>,
    {
      autoClose: options.preserve ? false : TOAST_DURATION,
      closeButton: false,
      className: classNames(styles.toast, {
        [styles.errorBody]: options.status === 'error',
        [styles.successBody]: options.status === 'success',
        [styles.warningBody]: options.status === 'warning',
      }),
    },
  );
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

export const useToast = () => {
  const setShouldRenderToast = useContext(ToastContext);

  return useCallback(
    (content: React.ReactNode, options: Options = {}) => {
      setShouldRenderToast(true);
      toast(content, options);
    },
    [setShouldRenderToast],
  );
};
