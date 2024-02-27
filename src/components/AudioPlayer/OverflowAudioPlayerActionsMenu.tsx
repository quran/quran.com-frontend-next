/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useState } from 'react';

import AudioPlayerOverflowMenuTrigger from './AudioPlayerOverflowMenuTrigger';
import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import OnboardingEvent from '@/components/Onboarding/OnboardingChecklist/hooks/OnboardingEvent';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import OnboardingGroup from '@/types/OnboardingGroup';
import { logEvent } from '@/utils/eventLogger';

const OverflowAudioPlayerActionsMenu = () => {
  const direction = useDirection();
  const { isActive, activeStepGroup, activeStepIndex, nextStep, prevStep } = useOnboarding();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleAfterChooseReciterStepNext = () => {
      setOpen(false);
      nextStep();
    };

    const handlePrevStep3 = () => {
      setOpen(false);
      prevStep();
    };

    const handleAfterAudioPlayerTriggerStepNext = () => {
      // manually click the trigger to open the audio player settings menu
      document.getElementById('audio-player-overflow-menu-trigger')?.click();
      nextStep();
    };

    window.addEventListener(
      OnboardingEvent.STEP_AFTER_CHOOSING_RECITER_FROM_LIST,
      handleAfterChooseReciterStepNext,
    );
    window.addEventListener(
      OnboardingEvent.STEP_AFTER_AUDIO_PLAYER_TRIGGER,
      handleAfterAudioPlayerTriggerStepNext,
    );
    window.addEventListener(OnboardingEvent.STEP_BEFORE_RECITER_LIST_ITEM_CLICK, handlePrevStep3);

    return () => {
      window.removeEventListener(
        OnboardingEvent.STEP_AFTER_CHOOSING_RECITER_FROM_LIST,
        handleAfterChooseReciterStepNext,
      );
      window.removeEventListener(
        OnboardingEvent.STEP_AFTER_AUDIO_PLAYER_TRIGGER,
        handleAfterAudioPlayerTriggerStepNext,
      );
      window.removeEventListener(
        OnboardingEvent.STEP_BEFORE_RECITER_LIST_ITEM_CLICK,
        handlePrevStep3,
      );
    };
  }, [nextStep, prevStep]);

  const onOpenChange = (newOpen: boolean) => {
    logEvent(`audio_player_overflow_menu_${open ? 'open' : 'close'}`);
    setOpen(newOpen);

    // If the user is in the reading experience onboarding and clicked on the play button, then we should automatically go to the next step when the audio player is mounted.
    if (
      newOpen &&
      isActive &&
      activeStepGroup === OnboardingGroup.READING_EXPERIENCE &&
      activeStepIndex === 2
    ) {
      nextStep();
    }
  };

  const shouldStayOpen =
    isActive &&
    activeStepGroup === OnboardingGroup.READING_EXPERIENCE &&
    (activeStepIndex === 3 || activeStepIndex === 4);

  return (
    <div dir={direction}>
      <PopoverMenu
        isOpen={open}
        isPortalled
        shouldClose={!shouldStayOpen}
        isModal={!shouldStayOpen} // in the onboarding, we want the popover to not be modal
        trigger={<AudioPlayerOverflowMenuTrigger />}
        onOpenChange={onOpenChange}
        contentClassName={styles.overriddenPopoverMenuContentPositioning}
      >
        <OverflowAudioPlayActionsMenuBody />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
