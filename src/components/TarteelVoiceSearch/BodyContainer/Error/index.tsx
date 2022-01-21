import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import ErrorIcon from '../../../../../public/icons/info.svg';
import MicrophoneIcon from '../../../../../public/icons/microphone.svg';
import NoMicrophoneIcon from '../../../../../public/icons/no-mic.svg';

import styles from './Error.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
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
        <Link href="https://download.tarteel.ai" newTab variant={LinkVariant.Highlight}>
          {t('tarteel.app')}
        </Link>
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
