import React from 'react';

import ErrorIcon from '../../../../../public/icons/info.svg';
import MicrophoneIcon from '../../../../../public/icons/microphone.svg';

import styles from './Error.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import VoiceError from 'types/Tarteel/VoiceError';

interface Props {
  error: VoiceError;
  isWaitingForPermission: boolean;
}

const Error: React.FC<Props> = ({ error, isWaitingForPermission }) => {
  let icon = null;
  let errorBody = null;
  if (isWaitingForPermission) {
    errorBody = <p>Please enable microphone permission to start using Voice Search</p>;
    icon = <MicrophoneIcon />;
  } else {
    let errorText = '';
    switch (error) {
      case VoiceError.NO_PERMISSION:
        errorText =
          'It looks like you do not have the microphone permissions enabled. Please enable the microphone permissions and try again or download the ';
        icon = <MicrophoneIcon />;
        break;
      case VoiceError.NOT_SUPPORTED:
        errorText =
          'It looks like your browser does not support microphone. Please try a different browser or download the ';
        icon = <MicrophoneIcon />;
        break;
      default:
        errorText = 'An error has occurred, please try again later. Or download the ';
        icon = <ErrorIcon />;
        break;
    }
    errorBody = (
      <div>
        <span>{errorText}</span>
        <Link href="https://www.tarteel.ai" newTab variant={LinkVariant.Highlight}>
          Tarteel app
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
