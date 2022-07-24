import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { FiChevronDown } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import styles from './PageNavigationButtons.module.scss';

import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import KeyboardInput from 'src/components/dls/KeyboardInput';
import { ContentSide } from 'src/components/dls/Tooltip';
import { selectAudioDataStatus } from 'src/redux/slices/AudioPlayer/state';
import AudioDataStatus from 'src/redux/types/AudioDataStatus';

interface Props {
  scrollToNextPage: () => void;
  scrollToPreviousPage: () => void;
}

const PageNavigationButtons: React.FC<Props> = ({ scrollToNextPage, scrollToPreviousPage }) => {
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
        size={ButtonSize.Small}
        className={styles.prevButton}
        onClick={scrollToPreviousPage}
        shouldFlipOnRTL={false}
        tooltip={
          <>
            {t('prev-page')} <KeyboardInput invertColors keyboardKey="⬆" />
          </>
        }
        tooltipContentSide={ContentSide.LEFT}
      >
        <FiChevronDown />
      </Button>
      <Button
        size={ButtonSize.Small}
        onClick={scrollToNextPage}
        tooltip={
          <>
            {t('next-page')} <KeyboardInput invertColors keyboardKey="⬇" />
          </>
        }
        tooltipContentSide={ContentSide.LEFT}
      >
        <FiChevronDown />
      </Button>
    </div>
  );
};

export default PageNavigationButtons;
