/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import {
  ToastContainer as PrimitiveToastContainer,
  toast as primitiveToast,
  cssTransition,
} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import styles from './Toast.module.scss';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';

type Action = {
  text: string;
  onClick?: () => void;
  primary?: boolean;
};
type Options = {
  preserve?: boolean;
  actions?: Action[];
  status?: 'success' | 'error' | 'warning';
};
const TOAST_DURATION = 3000; // 3 second
export const toast = (content: React.ReactNode, options: Options = {}) => {
  const toastId = primitiveToast(
    <div className={styles.contentContainer}>
      {content}
      {options.actions && (
        <div className={styles.actionsContainer}>
          {options.actions.map((action) => (
            <Button
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
