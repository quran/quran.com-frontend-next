import React from 'react';
import { useSelector } from 'react-redux';
import { selectAudioFile } from 'src/redux/slices/AudioPlayer/state';
import download from 'src/utils/download';
import { withStopPropagation } from 'src/utils/event';
import DownloadIcon from '../../../public/icons/download.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

const DownloadAudioButton = () => {
  const audioFile = useSelector(selectAudioFile);
  return (
    <Button
      onClick={withStopPropagation(() => download(audioFile.audioUrl))}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      size={ButtonSize.Large}
    >
      <DownloadIcon />
    </Button>
  );
};

export default DownloadAudioButton;
