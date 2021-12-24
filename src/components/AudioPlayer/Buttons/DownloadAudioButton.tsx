import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import DownloadIcon from '../../../../public/icons/download.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import {
  selectAudioData,
  selectIsDownloadingAudio,
  setIsDownloadingAudio,
} from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick } from 'src/utils/eventLogger';

const download = (url: string, onDone: () => void) => {
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
  const audioData = useSelector(selectAudioData, shallowEqual);
  const loading = useSelector(selectIsDownloadingAudio);
  const dispatch = useDispatch();

  const onClick = () => {
    logButtonClick('audio_player_download');
    dispatch(setIsDownloadingAudio(true));
    download(audioData.audioUrl, () => {
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
