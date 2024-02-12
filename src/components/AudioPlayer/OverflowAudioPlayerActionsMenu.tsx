import { useEffect, useState } from 'react';

import { useOnboarding } from '../Onboarding/OnboardingProvider';

import AudioPlayerOverflowMenuTrigger from './AudioPlayerOverflowMenuTrigger';
import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import OnboardingGroup from '@/types/OnboardingGroup';
import { logEvent } from '@/utils/eventLogger';

const OverflowAudioPlayerActionsMenu = () => {
  const direction = useDirection();
  const { isActive, activeStepGroup, activeStepIndex, nextStep, prevStep } = useOnboarding();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleNextStep4 = () => {
      setOpen(false);
      nextStep();
    };

    const handlePrevStep3 = () => {
      setOpen(false);
      prevStep();
    };

    window.addEventListener('onboardingNextStep4', handleNextStep4);
    window.addEventListener('onboardingPrevStep3', handlePrevStep3);

    return () => {
      window.removeEventListener('onboardingNextStep4', handleNextStep4);
      window.removeEventListener('onboardingPrevStep3', handlePrevStep3);
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
