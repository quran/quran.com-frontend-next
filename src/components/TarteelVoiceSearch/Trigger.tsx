import React, { useRef } from 'react';

import { useDispatch } from 'react-redux';

import MicrophoneIcon from '../../../public/icons/microphone.svg';

import styles from './Trigger.module.scss';

import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import useBrowserLayoutEffect from 'src/hooks/useBrowserLayoutEffect';
import {
  toggleIsSearchDrawerVoiceFlowStarted,
  toggleIsCommandBarVoiceFlowStarted,
} from 'src/redux/slices/voiceSearch';

interface Props {
  isCommandBar?: boolean;
}

const TarteelVoiceSearchTrigger: React.FC<Props> = ({ isCommandBar = false }) => {
  const isSupported = useRef(true);
  const dispatch = useDispatch();

  const onMicClicked = () => {
    dispatch({
      type: isCommandBar
        ? toggleIsCommandBarVoiceFlowStarted.type
        : toggleIsSearchDrawerVoiceFlowStarted.type,
    });
  };

  // check whether the microphone is supported first.
  useBrowserLayoutEffect(() => {
    isSupported.current =
      navigator.mediaDevices?.getUserMedia ||
      // @ts-ignore
      navigator.getUserMedia ||
      // @ts-ignore
      navigator.webkitGetUserMedia ||
      // @ts-ignore
      navigator.mozGetUserMedia;
  }, []);

  // if the mic is not supported.
  if (!isSupported.current) {
    return <></>;
  }

  return (
    <Button onClick={onMicClicked} variant={ButtonVariant.Ghost} className={styles.button}>
      <MicrophoneIcon />
    </Button>
  );
};

export default TarteelVoiceSearchTrigger;
