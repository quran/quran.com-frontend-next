import React, { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './Trigger.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import CloseIcon from '@/icons/close.svg';
import MicrophoneIcon from '@/icons/microphone.svg';
import {
  toggleIsSearchDrawerVoiceFlowStarted,
  toggleIsCommandBarVoiceFlowStarted,
  selectIsCommandBarVoiceFlowStarted,
  selectIsSearchDrawerVoiceFlowStarted,
} from '@/redux/slices/voiceSearch';

interface Props {
  isCommandBar?: boolean;
  onClick: (startFlow: boolean) => void;
}

const TarteelVoiceSearchTrigger: React.FC<Props> = ({ isCommandBar = false, onClick }) => {
  const { t } = useTranslation('common');
  const isSupported = useRef(true);
  const dispatch = useDispatch();
  const isCommandBarVoiceFlowStarted = useSelector(
    selectIsCommandBarVoiceFlowStarted,
    shallowEqual,
  );
  const isSearchDrawerVoiceFlowStarted = useSelector(
    selectIsSearchDrawerVoiceFlowStarted,
    shallowEqual,
  );

  const showCloseIcon =
    (isCommandBar && isCommandBarVoiceFlowStarted) ||
    (!isCommandBar && isSearchDrawerVoiceFlowStarted);

  const onMicClicked = () => {
    onClick(!showCloseIcon);
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
    <Button
      onClick={onMicClicked}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      className={styles.button}
      tooltip={t('command-bar.search-by-voice')}
      hasSidePadding={false}
      ariaLabel={t('command-bar.search-by-voice')}
    >
      {showCloseIcon ? <CloseIcon /> : <MicrophoneIcon />}
    </Button>
  );
};

export default TarteelVoiceSearchTrigger;
