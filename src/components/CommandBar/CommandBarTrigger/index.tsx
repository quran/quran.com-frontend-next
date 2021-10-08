import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './CommandBarTrigger.module.scss';

import KeyboardInput from 'src/components/dls/KeyboardInput';
import { toggleIsOpen } from 'src/redux/slices/CommandBar/state';

const CommandBarTrigger: React.FC = () => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch({ type: toggleIsOpen.type });
  }, [dispatch]);
  return (
    <button className={styles.container} type="button" onClick={onClick}>
      <IconSearch />
      <span className={styles.text}>Quick access to anything</span>
      <KeyboardInput meta keyboardKey="K" />
    </button>
  );
};

export default CommandBarTrigger;
