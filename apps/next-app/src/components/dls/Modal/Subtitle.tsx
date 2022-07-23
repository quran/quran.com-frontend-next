import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './Subtitle.module.scss';

const Subtitle = ({ children }) => (
  <DialogPrimitive.Description className={styles.subtitle}>{children}</DialogPrimitive.Description>
);

export default Subtitle;
