import { useContext, useEffect, useState } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import 'react-rangeslider/lib/index.css';
import styles from './VolumeControl.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Slider, { Orientation, SliderVariant } from '@/dls/Slider';
import useDirection from '@/hooks/useDirection';
import VolumeDownIcon from '@/icons/volume_down.svg';
import VolumeMuteIcon from '@/icons/volume_mute.svg';
import VolumeOffIcon from '@/icons/volume_off.svg';
import VolumeUpIcon from '@/icons/volume_up.svg';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

const VolumeControl = () => {
  const { t } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const volume = useSelector(audioService, (state) => state.context.volume);
  const [volumeIcon, setVolumeIcon] = useState(<VolumeUpIcon />);
  const direction = useDirection();

  const onVolumeChange = (value) => {
    audioService.send({
      type: 'SET_VOLUME',
      volume: value / 100,
    });
  };

  useEffect(() => {
    if (volume < 0.1) {
      setVolumeIcon(<VolumeOffIcon />);
    } else if (volume < 0.2) {
      setVolumeIcon(<VolumeMuteIcon />);
    } else if (volume < 0.5) {
      setVolumeIcon(<VolumeDownIcon />);
    } else {
      setVolumeIcon(<VolumeUpIcon />);
    }

    // issue with radix range height, setting part of slider to fill in
    (document.querySelector(':root') as HTMLElement).style.setProperty(
      '--volume',
      `${volume * 100}%`,
    );
  }, [volume]);

  return (
    <>
      <div dir={direction}>
        <PopoverMenu
          isPortalled
          isModal
          contentClassName={styles.VolumeControl__DropdownMenuContentOverride}
          trigger={
            <Button
              tooltip={t('audio.player.volume-ctrl')}
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
            >
              {volumeIcon}
            </Button>
          }
        >
          <div className={styles.VolumeControl__SlideContainer}>
            <Slider
              min={0}
              max={100}
              step={1}
              label="Volume"
              name="Volume"
              withBackground
              value={[volume * 100]}
              onValueChange={onVolumeChange}
              variant={SliderVariant.Primary}
              orientation={Orientation.Vertical}
            />
          </div>
        </PopoverMenu>
      </div>
    </>
  );
};

export default VolumeControl;
