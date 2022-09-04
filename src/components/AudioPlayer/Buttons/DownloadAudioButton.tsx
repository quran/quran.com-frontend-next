import React, { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import DownloadIcon from '@/icons/download.svg';
import { selectIsDownloadingAudio, setIsDownloadingAudio } from '@/redux/slices/AudioPlayer/state';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

export const download = (url: string, onDone: () => void) => {
  const splits = url.substring(url.lastIndexOf('/') + 1).split('?');
  const [filename] = splits;
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhr.response);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    onDone();
  };
  xhr.open('GET', url);
  xhr.send();
};

const DownloadAudioButton = () => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  const audioDataUrl = useXstateSelector(audioService, (state) => state.context.audioData.audioUrl);
  const loading = useSelector(selectIsDownloadingAudio);
  const dispatch = useDispatch();

  const onClick = () => {
    logButtonClick('audio_player_download');
    dispatch(setIsDownloadingAudio(true));
    download(audioDataUrl, () => {
      dispatch(setIsDownloadingAudio(false));
    });
  };

  return (
    <PopoverMenu.Item
      onClick={onClick}
      icon={loading ? <Spinner size={SpinnerSize.Large} /> : <DownloadIcon />}
    >
      {t('audio.player.download')}
    </PopoverMenu.Item>
  );
};

export default DownloadAudioButton;
