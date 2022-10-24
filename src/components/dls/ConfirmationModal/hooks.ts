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

/**
 * When this hook (useConfirmationModalInternal) is called.
 * We set `useState` in the component. So that it will trigger rerender when the state changes
 *
 * `setState` is registered to a global `listeners`.
 * Every time we `updateState`, this will update the  state in every components that subscribe
 * to the changes (listeners)
 */

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

/**
 * This hook is meant to be consumed by other components
 * Check ConfirmationModal.stories.tsx for an example
 *
 * This hook return a callback, that's when called return a Promise<boolean>
 * if the user click "confirm", boolean will be true, otherwise it will be false
 */

export const useConfirm = () => {
  const confirm = (state: State) => {
    updateState({ ...state, open: true });
    return new Promise((res) => {
      resolveCallback = res;
    });
  };

  return confirm;
};
