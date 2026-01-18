import React from 'react';

import styles from './Label.module.scss';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Label = ({ children, className, style }: LabelProps) => (
  <div className={`${styles.label} ${className || ''}`} style={style}>
    {children}
  </div>
);

export default Label;
