import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import DownloadIcon from '../../../public/icons/download.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';

import { selectAudioFile } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

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
  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const [loading, setLoading] = React.useState(false);

  const onClick = withStopPropagation(() => {
    setLoading(true);
    download(audioFile.audioUrl, () => {
      setLoading(false);
    });
    setLoading(true);
  });

  return (
    <Button
      tooltip="Download"
      onClick={onClick}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
    >
      {loading ? <Spinner size={SpinnerSize.Large} /> : <DownloadIcon />}
    </Button>
  );
};

export default DownloadAudioButton;
