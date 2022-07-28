import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';
import { AudioPlayerMachineContext } from '../audioPlayerMachine';

import styles from './SelectReciterMenu.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import usePersistPreferenceGroup from 'src/hooks/usePersistPreferenceGroup';
import {
  selectAudioPlayerState,
  setReciterAndPauseAudio,
} from 'src/redux/slices/AudioPlayer/state';
import { makeAvailableRecitersUrl } from 'src/utils/apiPaths';
import { logButtonClick, logItemSelectionChange, logValueChange } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import QueryParam from 'types/QueryParam';
import Reciter from 'types/Reciter';

const DEFAULT_RECITATION_STYLE = 'Murattal';

const SelectReciterMenu = ({ onBack }) => {
  const { lang, t } = useTranslation('common');
  const { value: selectedReciterId }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
  );
  const audioPlayerState = useSelector(selectAudioPlayerState);
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const audioPlayerService = useContext(AudioPlayerMachineContext);

  const onReciterSelected = useCallback(
    (reciter: Reciter) => {
      audioPlayerService.send({ type: 'REQUEST_CHANGE_RECITER', reciterId: reciter.id });
      // onSettingsChange(
      //   'reciter',
      //   reciter.id,
      //   setReciterAndPauseAudio({ reciter, locale: lang }),
      //   setReciterAndPauseAudio({ reciter: audioPlayerState.reciter, locale: lang }),
      //   PreferenceGroup.AUDIO,
      //   onBack,
      // );
    },
    [audioPlayerService],
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
