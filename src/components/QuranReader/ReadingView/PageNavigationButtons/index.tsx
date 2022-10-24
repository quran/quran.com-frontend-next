import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PageNavigationButtons.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import KeyboardInput from '@/dls/KeyboardInput';
import { ContentSide } from '@/dls/Tooltip';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface Props {
  scrollToNextPage: () => void;
  scrollToPreviousPage: () => void;
}

const PageNavigationButtons: React.FC<Props> = ({ scrollToNextPage, scrollToPreviousPage }) => {
  const { t } = useTranslation('quran-reader');
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlayerHidden = useSelector(audioService, (state) => state.matches('HIDDEN'));
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
        <ChevronDownIcon />
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
        <ChevronDownIcon />
      </Button>
    </div>
  );
};

export default PageNavigationButtons;
