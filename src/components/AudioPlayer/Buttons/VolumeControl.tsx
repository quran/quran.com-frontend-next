/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import styles from '@/components/AudioPlayer/OverflowAudioPlayerActionsMenu.module.scss';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import VolumeUpIcon from '@/icons/volume_up.svg';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

const VolumeControl = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const audioService = useContext(AudioPlayerMachineContext);
  const volume = useSelector(audioService, (state) => state.context.volume);
  const direction = useDirection();

  const onVolumeChange = (value) => {
    audioService.send({
      type: 'SET_VOLUME',
      volume: value / 100,
    });
  };

  return (
    <>
      <div dir={direction}>
        <PopoverMenu
          isPortalled
          isModal
          trigger={
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={() => setIsOpen(!isOpen)}
            >
              <VolumeUpIcon />
            </Button>
          }
          contentClassName={styles.overriddenPopoverMenuContentPositioning}
        >
          <Slider
            value={volume * 100}
            orientation="vertical"
            format={(p) => `${Math.trunc(p)}%`}
            onChange={onVolumeChange}
          />
        </PopoverMenu>
      </div>
    </>
  );
};

export default VolumeControl;
