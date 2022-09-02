import React, { useCallback, useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './SelectReciterMenu.module.scss';

import CheckIcon from '@/icons/check.svg';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import DataFetcher from 'src/components/DataFetcher';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import usePersistPreferenceGroup from 'src/hooks/auth/usePersistPreferenceGroup';
import { makeAvailableRecitersUrl } from 'src/utils/apiPaths';
import { logButtonClick, logItemSelectionChange, logValueChange } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { RecitersResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import Reciter from 'types/Reciter';

const DEFAULT_RECITATION_STYLE = 'Murattal';

const SelectReciterMenu = ({ onBack }) => {
  const { lang, t } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const selectedReciterId = useSelector(audioService, (state) => state.context.reciterId);

  const {
    actions: { onXstateSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const onReciterSelected = useCallback(
    (reciter: Reciter) => {
      const previousReciterId = selectedReciterId;
      onXstateSettingsChange(
        'reciter',
        reciter.id,
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: reciter.id }),
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: previousReciterId }),
        PreferenceGroup.AUDIO,
        onBack,
      );
    },
    [audioService, onBack, onXstateSettingsChange, selectedReciterId],
  );

  const getItemIcon = useCallback(
    (reciterId: number, newlySelectedReciterId: number) => {
      if (newlySelectedReciterId === reciterId) {
        if (isLoading) {
          return <Spinner />;
        }
        return <CheckIcon />;
      }
      return <span />;
    },
    [isLoading],
  );

  const renderReciter = useCallback(
    (data: RecitersResponse) => {
      return (
        <div>
          {data.reciters.map((reciter) => (
            <PopoverMenu.Item
              key={reciter.id}
              icon={getItemIcon(reciter.id, selectedReciterId)}
              onClick={() => {
                logButtonClick('audio_player_overflow_menu_reciter_item');
                logValueChange('reciter', selectedReciterId, reciter.id);
                logItemSelectionChange('reciter', reciter.id);
                onReciterSelected(reciter);
              }}
            >
              {reciter.translatedName.name}
              {reciter.style.name !== DEFAULT_RECITATION_STYLE && (
                <p className={styles.reciterStyle}>{` - ${reciter.style.name}`}</p>
              )}
            </PopoverMenu.Item>
          ))}
        </div>
      );
    },
    [getItemIcon, selectedReciterId, onReciterSelected],
  );

  const reciters = <DataFetcher queryKey={makeAvailableRecitersUrl(lang)} render={renderReciter} />;

  return (
    <>
      <PopoverMenu.Item icon={<ChevronLeftIcon />} onClick={onBack} shouldFlipOnRTL>
        {t('audio.select-reciter')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {reciters}
    </>
  );
};

export default SelectReciterMenu;
