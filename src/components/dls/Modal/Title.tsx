import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './Title.module.scss';

const Title = ({ children }) => (
  <DialogPrimitive.Title className={styles.title}>{children}</DialogPrimitive.Title>
);

export default Title;
