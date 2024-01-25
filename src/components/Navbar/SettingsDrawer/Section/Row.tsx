import React from 'react';

import styles from './Row.module.scss';

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {}

const Row = (props: RowProps) => <div className={styles.row} {...props} />;

export default Row;
