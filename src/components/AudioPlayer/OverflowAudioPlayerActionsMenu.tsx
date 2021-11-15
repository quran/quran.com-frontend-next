/* eslint-disable react/no-multi-comp */
import { useState, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';

import AudioSpeedMenu from './Buttons/AudioSpeedMenu';
import CloseButton from './Buttons/CloseButton';
import DownloadAudioButton from './Buttons/DownloadAudioButton';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import useDirection from 'src/hooks/useDirection';
import { selectPlaybackRate } from 'src/redux/slices/AudioPlayer/state';

enum AudioPlayerMenu {
  Main = 'main',
  AudioSpeed = 'audio-speed',
}

const OverflowMenuBody = () => {
  const [selectedMenu, setSelectedMenu] = useState<AudioPlayerMenu>(AudioPlayerMenu.Main);
  const { t } = useTranslation('common');
  const playbackRate = useSelector(selectPlaybackRate);

  const menus = useMemo(
    () => ({
      [AudioPlayerMenu.Main]: [
        <DownloadAudioButton />,
        <PopoverMenu.Item
          icon={
            <span className={styles.audioSpeedText}>
              {playbackRate}
              {t('audio.playback-speed-unit')}
            </span>
          }
          onClick={() => setSelectedMenu(AudioPlayerMenu.AudioSpeed)}
        >
          {t('audio.playback-speed')}
        </PopoverMenu.Item>,
        <PopoverMenu.Divider />,
        <CloseButton />,
      ],
      [AudioPlayerMenu.AudioSpeed]: (
        <AudioSpeedMenu onBack={() => setSelectedMenu(AudioPlayerMenu.Main)} />
      ),
    }),
    [t, playbackRate],
  );

  return <>{menus[selectedMenu]}</>;
};

const OverflowAudioPlayerActionsMenu = () => {
  const { t } = useTranslation('common');
  const direction = useDirection();

  return (
    <div dir={direction} className={styles.overriddenPopoverMenuContentPositioning}>
      <PopoverMenu
        isPortalled={false}
        trigger={
          <Button tooltip={t('more')} variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
            <OverflowMenuIcon />
          </Button>
        }
      >
        <OverflowMenuBody />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
