import { useCallback } from 'react';
import { createGlobalState } from 'react-use';
import { v4 as uuid } from 'uuid';

type ToastType = {
  id: string;
  message: string;
  props?: Partial<ToastProps>;
};

export type ToastProps = {
  danger?: boolean;
  delay?: number;
  duration?: number;
  id: string;
  message?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onRemove?: (id: string) => void;
  refresh?: boolean;
  success?: boolean;
  info?: boolean;
  title?: React.ReactNode;
};

export const useGlobalToasts = createGlobalState<ToastType[]>([]);

const useToasts = () => {
  const [toasts, setToasts] = useGlobalToasts();

  const addToast = useCallback(
    (message: string, type: keyof ToastProps, props: ToastType['props'] = {}) => {
      const id = props.id || uuid();

      setToasts([
        ...toasts.filter((toast) => toast.id !== id),
        {
          id,
          message,
          props: {
            ...props,
            [type]: true,
          },
        },
      ]);

      return id;
    },
    [toasts, setToasts],
  );

  const addRefreshToast = (message: string) => addToast(message, 'refresh', { duration: 0 });
  const addInfoToast = (message: string, props?: ToastType['props']) =>
    addToast(message, 'info', props);
  const addSuccessToast = (message: string, props?: ToastType['props']) =>
    addToast(message, 'success', props);
  const addDangerToast = (message: string, props?: ToastType['props']) =>
    addToast(message, 'danger', props);

  const removeToast = useCallback(
    (id: string) => {
      setToasts(toasts.filter((toast) => toast.id !== id));
    },
    [toasts, setToasts],
  );

  const methods = {
    toasts,
    addToast,
    addRefreshToast,
    addInfoToast,
    addSuccessToast,
    addDangerToast,
    addFailureToast: addDangerToast,
    removeToast,
  };

  return methods;
};

export default useToasts;
