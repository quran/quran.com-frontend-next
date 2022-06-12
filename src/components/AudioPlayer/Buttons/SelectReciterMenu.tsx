import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import styles from './SelectReciterMenu.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import {
  selectAudioPlayerState,
  setReciterAndPauseAudio,
} from 'src/redux/slices/AudioPlayer/state';
import { makeAvailableRecitersUrl } from 'src/utils/apiPaths';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
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
  const { playbackRate, showTooltipWhenPlayingAudio, enableAutoScrolling, repeatSettings } =
    audioPlayerState;

  const dispatch = useDispatch();

  const onReciterSelected = useCallback(
    (reciter: Reciter) => {
      if (isLoggedIn()) {
        const newAudioState = {
          playbackRate,
          reciter: reciter.id,
          showTooltipWhenPlayingAudio,
          enableAutoScrolling,
          repeatSettings,
        };
        addOrUpdateUserPreference(newAudioState, PreferenceGroup.AUDIO)
          .then(() => {
            dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
            onBack();
          })
          .catch(() => {
            // TODO: show an error
          });
      } else {
        dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
        onBack();
      }
    },
    [
      dispatch,
      enableAutoScrolling,
      lang,
      onBack,
      playbackRate,
      repeatSettings,
      showTooltipWhenPlayingAudio,
    ],
  );

  const renderReciter = useCallback(
    (data: RecitersResponse) => {
      return (
        <div>
          {data.reciters.map((reciter) => (
            <PopoverMenu.Item
              key={reciter.id}
              icon={selectedReciterId === reciter.id ? <CheckIcon /> : <span />}
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
    [selectedReciterId, onReciterSelected],
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
