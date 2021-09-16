import React, { MouseEvent } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './Action.module.scss';

type CloseActionProps = {
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  isDisabled?: boolean;
};

const CloseAction = ({ children, onClick, isDisabled }: CloseActionProps) => (
  <DialogPrimitive.Close className={styles.action} onClick={onClick} disabled={isDisabled}>
    {children}
  </DialogPrimitive.Close>
);

export default CloseAction;
