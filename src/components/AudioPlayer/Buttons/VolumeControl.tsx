import { useContext, useEffect, useState } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import Slider from 'react-rangeslider';

import 'react-rangeslider/lib/index.css';
import styles from './VolumeControl.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
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
