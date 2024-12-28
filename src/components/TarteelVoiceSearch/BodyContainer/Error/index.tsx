import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Error.module.scss';

import ErrorIcon from '@/icons/info.svg';
import MicrophoneIcon from '@/icons/microphone.svg';
import NoMicrophoneIcon from '@/icons/no-mic.svg';
import VoiceError from 'types/Tarteel/VoiceError';

interface Props {
  error: VoiceError;
  isWaitingForPermission: boolean;
}

const Error: React.FC<Props> = ({ error, isWaitingForPermission }) => {
  const { t } = useTranslation('common');
  let icon = null;
  let errorBody = null;
  if (isWaitingForPermission) {
    errorBody = <p>{t('voice.ask-permission')}</p>;
    icon = <MicrophoneIcon />;
  } else {
    let errorText = '';
    switch (error) {
      case VoiceError.NO_PERMISSION:
        errorText = t('voice.no-permission');
        icon = <NoMicrophoneIcon />;
        break;
      case VoiceError.NOT_SUPPORTED:
        errorText = t('voice.not-supported');
        icon = <NoMicrophoneIcon />;
        break;
      default:
        errorText = t('voice.error');
        icon = <ErrorIcon />;
        break;
    }
    errorBody = (
      <div>
        <span>{errorText}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {icon}
      {errorBody}
    </div>
  );
};

export default Error;
