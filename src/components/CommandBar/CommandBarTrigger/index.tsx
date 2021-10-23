import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './CommandBarTrigger.module.scss';

import KeyboardInput from 'src/components/dls/KeyboardInput';
import TarteelVoiceSearchTrigger from 'src/components/TarteelVoiceSearch/Trigger';
import { toggleIsOpen } from 'src/redux/slices/CommandBar/state';

const CommandBarTrigger: React.FC = () => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch({ type: toggleIsOpen.type });
  }, [dispatch]);
  return (
    <button className={styles.container} type="button" onClick={onClick}>
      <IconSearch />
      <span>Quick access to anything</span>
      <div className={styles.actionsContainer}>
        <KeyboardInput meta keyboardKey="K" />
        <TarteelVoiceSearchTrigger isCommandBar />
      </div>
    </button>
  );
};

export default CommandBarTrigger;
