import { useContext, useEffect, useState } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './VolumeControl.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Slider, { SliderVariant } from '@/dls/Slider';
import useDirection from '@/hooks/useDirection';
import NoSoundIcon from '@/icons/no-sound.svg';
import VolumeDownIcon from '@/icons/volume-down.svg';
import VolumeUpIcon from '@/icons/volume-up.svg';
import { logValueChange } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

const VOLUME_CONTROL_CLOSE_DELAY = 1500;
const VOLUME_ICONS = {
  VOLUME_UP: <VolumeUpIcon />,
  VOLUME_DOWN: <VolumeDownIcon />,
  NO_SOUND: <NoSoundIcon />,
};

const getVolumeIconType = (volume: number): keyof typeof VOLUME_ICONS => {
  if (volume < 1) return 'NO_SOUND';
  if (volume < 50) return 'VOLUME_DOWN';
  return 'VOLUME_UP';
};

const VolumeControl = () => {
  const direction = useDirection();
  const { t } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const volume = useSelector(audioService, (state) => state.context.volume);

  const [isOpen, setIsOpen] = useState(false);
  const [icon, setIcon] = useState(getVolumeIconType(volume * 100));

  const handleVolumeChange = ([newVolume]: number[]) => {
    logValueChange('audio_player_volume', volume, newVolume);
    audioService.send({
      type: 'UPDATE_VOLUME',
      volume: newVolume / 100,
    });
    setIcon(getVolumeIconType(newVolume));
  };

  // Auto close volume control popover after a value is selected
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, VOLUME_CONTROL_CLOSE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [volume]);

  return (
    <div dir={direction}>
      <PopoverMenu
        isPortalled
        isModal
        isOpen={isOpen}
        contentClassName={styles.content}
        onOpenChange={setIsOpen}
        trigger={
          <Button
            tooltip={t('audio.player.volume-control')}
            shape={ButtonShape.Circle}
            variant={ButtonVariant.Ghost}
          >
            {VOLUME_ICONS[icon]}
          </Button>
        }
      >
        <Slider
          min={0}
          max={100}
          step={1}
          label="Volume"
          withBackground
          value={[volume * 100]}
          onValueChange={handleVolumeChange}
          variant={SliderVariant.Primary}
        />
      </PopoverMenu>
    </div>
  );
};

export default VolumeControl;
