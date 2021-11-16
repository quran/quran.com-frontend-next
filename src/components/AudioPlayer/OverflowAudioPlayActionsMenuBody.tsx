import { useState, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChevronRightIcon from '../../../public/icons/chevron-right.svg';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import AudioPlaybackRateMenu from './Buttons/AudioPlaybackRateMenu';
import CloseButton from './Buttons/CloseButton';
import DownloadAudioButton from './Buttons/DownloadAudioButton';
import styles from './OverflowAudioPlayActionsMenuBody.module.scss';

import { selectPlaybackRate } from 'src/redux/slices/AudioPlayer/state';

/**
 * We're using (`1x` `1.25x`) as a replacement for `icon` in popover menu
 * So we need to adjust the font to make it fit the containeer
 *
 * @returns {number} fontSize
 */
const getPlaybackRateLabelFontSize = (playbackRates: number) => {
  const numberOfCharacter = playbackRates.toString().length;
  if (numberOfCharacter >= 4) return 11;
  return 14;
};

enum AudioPlayerOverflowMenu {
  Main = 'main',
  AudioSpeed = 'audio-speed',
}

const OverflowAudioPlayActionsMenuBody = () => {
  const [selectedMenu, setSelectedMenu] = useState<AudioPlayerOverflowMenu>(
    AudioPlayerOverflowMenu.Main,
  );
  const { t } = useTranslation('common');
  const playbackRate = useSelector(selectPlaybackRate);

  const menus = useMemo(
    () => ({
      [AudioPlayerOverflowMenu.Main]: [
        <DownloadAudioButton />,
        <PopoverMenu.Item
          icon={
            <span style={{ fontSize: getPlaybackRateLabelFontSize(playbackRate) }}>
              {playbackRate}
              {t('audio.playback-speed-unit')}
            </span>
          }
          onClick={() => setSelectedMenu(AudioPlayerOverflowMenu.AudioSpeed)}
        >
          <div className={styles.audioPlaybackRateMenuContainer}>
            {t('audio.playback-speed')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
        <PopoverMenu.Divider />,
        <CloseButton />,
      ],
      [AudioPlayerOverflowMenu.AudioSpeed]: (
        <AudioPlaybackRateMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
    }),
    [t, playbackRate],
  );

  return <>{menus[selectedMenu]}</>;
};

export default OverflowAudioPlayActionsMenuBody;
