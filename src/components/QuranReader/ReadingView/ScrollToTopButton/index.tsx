import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChevronDownIcon from '../../../../../public/icons/chevron-down.svg';

import styles from './ScrollToTopButton.module.scss';

import Button, {
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from 'src/components/dls/Button/Button';
import { ContentSide } from 'src/components/dls/Tooltip';
import { selectAudioDataStatus } from 'src/redux/slices/AudioPlayer/state';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';

interface Props {
  scrollToTop: () => void;
}

const PageNavigationButtons: React.FC<Props> = ({ scrollToTop }) => {
  const { t } = useTranslation('quran-reader');
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isAudioPlayerHidden = audioDataStatus === AudioDataStatus.NoFile;
  return (
    <div
      className={classNames(styles.buttonsContainer, {
        [styles.audioPlayerOpen]: !isAudioPlayerHidden,
      })}
    >
      <Button
        size={ButtonSize.Large}
        className={styles.button}
        onClick={scrollToTop}
        variant={ButtonVariant.Shadow}
        type={ButtonType.Secondary}
        shape={ButtonShape.Circle}
        shouldFlipOnRTL={false}
        tooltip="Scroll to top"
        tooltipContentSide={ContentSide.LEFT}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
};

export default PageNavigationButtons;
