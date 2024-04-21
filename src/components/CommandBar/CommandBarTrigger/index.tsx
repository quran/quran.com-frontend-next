import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './CommandBarTrigger.module.scss';

import TarteelVoiceSearchTrigger from '@/components/TarteelVoiceSearch/Trigger';
import KeyboardInput from '@/dls/KeyboardInput';
import IconSearch from '@/icons/search.svg';
import { toggleIsOpen } from '@/redux/slices/CommandBar/state';
import { logButtonClick } from '@/utils/eventLogger';

const CommandBarTrigger: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    logButtonClick('command_bar_homepage_trigger');
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
        <div className={styles.searchButtonWrapper} id="voice-search-trigger">
          <TarteelVoiceSearchTrigger
            isCommandBar
            onClick={() => {
              logButtonClick('command_bar_homepage_voice_search_trigger');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CommandBarTrigger;
