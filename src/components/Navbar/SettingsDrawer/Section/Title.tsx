import React from 'react';
import styles from './Title.module.scss';

const Title = ({ children }) => <div className={styles.title}>{children}</div>;

export default Title;
