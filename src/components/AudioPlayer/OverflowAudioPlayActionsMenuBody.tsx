import { useState, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChevronRightIcon from '../../../public/icons/chevron-right.svg';
import PersonIcon from '../../../public/icons/person.svg';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import AudioPlaybackRateMenu from './Buttons/AudioPlaybackRateMenu';
import CloseButton from './Buttons/CloseButton';
import DownloadAudioButton from './Buttons/DownloadAudioButton';
import SelectReciterMenu from './Buttons/SelectReciterMenu';
import styles from './OverflowAudioPlayActionsMenuBody.module.scss';

import { selectPlaybackRate } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick } from 'src/utils/eventLogger';

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
  Reciter = 'reciter',
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
        <DownloadAudioButton key={0} />,
        <PopoverMenu.Item
          key={1}
          icon={
            <span style={{ fontSize: getPlaybackRateLabelFontSize(playbackRate) }}>
              {playbackRate}
              {t('audio.playback-speed-unit')}
            </span>
          }
          onClick={() => {
            logButtonClick(`audio_player_menu_playback`);
            setSelectedMenu(AudioPlayerOverflowMenu.AudioSpeed);
          }}
        >
          <div className={styles.menuWithNestedItems}>
            {t('audio.playback-speed')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
        <PopoverMenu.Item
          key={2}
          icon={<PersonIcon />}
          onClick={() => {
            logButtonClick(`audio_player_menu_reciter`);
            setSelectedMenu(AudioPlayerOverflowMenu.Reciter);
          }}
        >
          <div className={styles.menuWithNestedItems}>
            {t('audio.select-reciter')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
        <PopoverMenu.Divider key={3} />,
        <CloseButton key={4} />,
      ],
      [AudioPlayerOverflowMenu.AudioSpeed]: (
        <AudioPlaybackRateMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
      [AudioPlayerOverflowMenu.Reciter]: (
        <SelectReciterMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
    }),
    [t, playbackRate],
  );

  return <>{menus[selectedMenu]}</>;
};

export default OverflowAudioPlayActionsMenuBody;
