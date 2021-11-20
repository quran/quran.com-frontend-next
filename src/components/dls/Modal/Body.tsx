import React from 'react';

import styles from './Body.module.scss';

const Body = ({ children }) => <div className={styles.body}>{children}</div>;

export default Body;
