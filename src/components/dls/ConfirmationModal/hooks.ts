import { useEffect, useState } from 'react';

type State = {
  title?: string;
  subtitle?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  open?: boolean;
};

let memoryState: State = {
  open: false,
};

const updateState = (newState: State) => {
  memoryState = newState;
  listeners.forEach((listener) => listener(memoryState));
};

const listeners: Array<(state: State) => void> = [];

export const useConfirmModal = () => {
  const [state, setState] = useState(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const closeConfirm = () => {
    updateState({ ...state, open: false });
  };

  const onConfirm = () => {
    closeConfirm();
    resolveCallback(true);
  };

  const onCancel = () => {
    closeConfirm();
    resolveCallback(false);
  };

  return { state, onCancel, onConfirm };
};

let resolveCallback: (arg: boolean) => void;
export const useConfirm = () => {
  const confirm = (state: State) => {
    updateState({ ...state, open: true });
    return new Promise((res) => {
      resolveCallback = res;
    });
  };

  return confirm;
};
