import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './CommandBarTrigger.module.scss';

import KeyboardInput from 'src/components/dls/KeyboardInput';
import TarteelVoiceSearchTrigger from 'src/components/TarteelVoiceSearch/Trigger';
import { toggleIsOpen } from 'src/redux/slices/CommandBar/state';

const CommandBarTrigger: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch({ type: toggleIsOpen.type });
  }, [dispatch]);
  return (
    <div
      role="button"
      onKeyPress={onClick}
      tabIndex={0}
      className={styles.container}
      onClick={onClick}
      key="commandbar-trigger"
      id="command-bar"
    >
      <div className={styles.leftSection}>
        <IconSearch />
        <span className={styles.placeholder}>{t('command-bar.placeholder')}</span>
      </div>
      <div className={styles.actionsContainer}>
        <KeyboardInput meta keyboardKey="K" />
        <div className={styles.searchButtonWrapper}>
          <TarteelVoiceSearchTrigger isCommandBar />
        </div>
      </div>
    </div>
  );
};

export default CommandBarTrigger;
