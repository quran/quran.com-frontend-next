import React from 'react';

import classNames from 'classnames';

import styles from './Footer.module.scss';

interface FooterProps {
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
}

const Footer = ({ children, visible = true, className }: FooterProps) => (
  <div
    className={classNames(styles.footer, className, {
      [styles.invisible]: !visible,
    })}
  >
    {children}
  </div>
);

export default Footer;
