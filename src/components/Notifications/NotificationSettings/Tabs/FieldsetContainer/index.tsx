import React from 'react';

import styles from './FieldsetContainer.module.scss';

type Props = {
  children: React.ReactNode;
  title: React.ReactNode;
};

const FieldsetContainer: React.FC<Props> = ({ children, title }) => {
  return (
    <fieldset className={styles.channelsContainer}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
};

export default FieldsetContainer;
