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
import { selectScrollToTop } from 'src/redux/slices/QuranReader/scrollToTop';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';

interface Props {
  scrollToTop: () => void;
}

const PageNavigationButtons: React.FC<Props> = ({ scrollToTop }) => {
  const { t } = useTranslation('common');
  const { showScrollToTop } = useSelector(selectScrollToTop);
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isAudioPlayerHidden = audioDataStatus === AudioDataStatus.NoFile;
  return (
    <div
      className={classNames(styles.buttonsContainer, {
        [styles.audioPlayerOpen]: !isAudioPlayerHidden,
        [styles.active]: showScrollToTop,
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
        tooltip={showScrollToTop ? t('scroll-top') : undefined}
        tooltipContentSide={ContentSide.LEFT}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
};

export default PageNavigationButtons;
