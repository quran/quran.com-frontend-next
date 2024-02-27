import { useState, useMemo, useContext, useEffect } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import AudioExperienceMenu from './Buttons/AudioExperienceMenu';
import AudioPlaybackRateMenu from './Buttons/AudioPlaybackRateMenu';
import DownloadAudioButton from './Buttons/DownloadAudioButton';
import RepeatButton from './Buttons/RepeatButton';
import SelectReciterMenu from './Buttons/SelectReciterMenu';
import styles from './OverflowAudioPlayActionsMenuBody.module.scss';

import OnboardingEvent from '@/components/Onboarding/OnboardingChecklist/hooks/OnboardingEvent';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import ExperienceIcon from '@/icons/experience.svg';
import PersonIcon from '@/icons/person.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

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
  Experience = 'experience',
}

const OverflowAudioPlayActionsMenuBody = () => {
  const [selectedMenu, setSelectedMenu] = useState<AudioPlayerOverflowMenu>(
    AudioPlayerOverflowMenu.Main,
  );
  const audioService = useContext(AudioPlayerMachineContext);
  const { t } = useTranslation('common');
  const playbackRate = useSelector(audioService, (state) => state.context.playbackRate);
  const { prevStep, nextStep } = useOnboarding();

  useEffect(() => {
    const handler = () => {
      setSelectedMenu(AudioPlayerOverflowMenu.Main);
      prevStep();
    };

    const handleNextOpenRecitersListStep = () => {
      setSelectedMenu(AudioPlayerOverflowMenu.Reciter);
      nextStep();
    };

    window.addEventListener(OnboardingEvent.STEP_BEFORE_CHOOSING_RECITER_FROM_LIST, handler);
    window.addEventListener(
      OnboardingEvent.STEP_AFTER_RECITER_LIST_ITEM_CLICK,
      handleNextOpenRecitersListStep,
    );
    return () => {
      window.removeEventListener(OnboardingEvent.STEP_BEFORE_CHOOSING_RECITER_FROM_LIST, handler);
      window.removeEventListener(
        OnboardingEvent.STEP_AFTER_RECITER_LIST_ITEM_CLICK,
        handleNextOpenRecitersListStep,
      );
    };
  }, [nextStep, prevStep]);

  const menus = useMemo(
    () => ({
      [AudioPlayerOverflowMenu.Main]: [
        <DownloadAudioButton key={0} />,
        <RepeatButton key={1} />,
        <PopoverMenu.Divider key={2} />,
        <PopoverMenu.Item
          key={3}
          icon={<ExperienceIcon />}
          onClick={() => {
            logButtonClick(`audio_player_overflow_menu_experience`); // TODO: log this
            setSelectedMenu(AudioPlayerOverflowMenu.Experience);
          }}
        >
          <div className={styles.menuWithNestedItems}>
            {t('audio.experience')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
        <PopoverMenu.Item
          key={4}
          icon={
            <span style={{ fontSize: getPlaybackRateLabelFontSize(playbackRate) }}>
              {playbackRate}
              {t('audio.playback-speed-unit')}
            </span>
          }
          onClick={() => {
            logButtonClick(`audio_player_overflow_menu_playback`);
            setSelectedMenu(AudioPlayerOverflowMenu.AudioSpeed);
          }}
        >
          <div className={styles.menuWithNestedItems}>
            {t('audio.speed')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
        <PopoverMenu.Item
          key={5}
          icon={<PersonIcon />}
          onClick={() => {
            logButtonClick(`audio_player_overflow_menu_reciter`);
            setSelectedMenu(AudioPlayerOverflowMenu.Reciter);
          }}
          id="audio-player-overflow-menu-reciter"
        >
          <div className={styles.menuWithNestedItems}>
            {t('reciter')}
            <ChevronRightIcon />
          </div>
        </PopoverMenu.Item>,
      ],
      [AudioPlayerOverflowMenu.AudioSpeed]: (
        <AudioPlaybackRateMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
      [AudioPlayerOverflowMenu.Reciter]: (
        <SelectReciterMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
      [AudioPlayerOverflowMenu.Experience]: (
        <AudioExperienceMenu onBack={() => setSelectedMenu(AudioPlayerOverflowMenu.Main)} />
      ),
    }),
    [t, playbackRate],
  );

  return <>{menus[selectedMenu]}</>;
};

export default OverflowAudioPlayActionsMenuBody;
