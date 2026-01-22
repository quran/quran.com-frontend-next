import React, { MouseEvent } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './Action.module.scss';

type CloseActionProps = {
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  isDisabled?: boolean;
  dataTestId?: string;
};

const CloseAction = ({ children, onClick, isDisabled, dataTestId }: CloseActionProps) => (
  <DialogPrimitive.Close
    className={styles.action}
    onClick={onClick}
    disabled={isDisabled}
    data-testid={dataTestId}
  >
    {children}
  </DialogPrimitive.Close>
);

export default CloseAction;
