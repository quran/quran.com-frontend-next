import React from 'react';

import styles from './Header.module.scss';

const Header = ({ children }) => <div className={styles.header}>{children}</div>;

export default Header;
