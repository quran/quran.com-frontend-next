import React from 'react';
import styles from './Pill.module.scss';

const Pill = ({ title }) => <div className={styles.container}>{title}</div>;

export default Pill;
