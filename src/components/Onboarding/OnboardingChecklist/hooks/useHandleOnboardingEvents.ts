/* eslint-disable react-func/max-lines-per-function */
import { useDispatch } from 'react-redux';

import OnboardingEvent from './OnboardingEvent';

import { SettingsView, setIsSettingsDrawerOpen, setSettingsView } from '@/redux/slices/navbar';
import OnboardingGroup from '@/types/OnboardingGroup';

interface UseHandleOnboardingEventsParams {
  group: OnboardingGroup;
  index: number;
  isLastStep: boolean; // is the current step the last step of the current group
}

type EventHookResult = {
  // a number in milliseconds that will be used to delay
  // the proceeding of the action (prev/next).
  delay?: number;

  // if false, the action (prev/next) will not proceed automatically.
  // this is useful when you want another component to handle the proceeding.
  automaticallyProceed?: boolean;
};

interface UseHandleOnboardingEventsReturn {
  beforePrev: () => EventHookResult;
  beforeNext: () => EventHookResult;
  beforeSkip: () => EventHookResult;
}

/**
 * This hook is an abstraction of the custom logic required for different parts of the onboarding. Example: Opening the settings drawer when the user clicks on "Next" in the settings onboarding.
 *
 * @param {UseHandleOnboardingEventsParams} params
 * @returns {UseHandleOnboardingEventsReturn}
 */
const useHandleOnboardingEvents = ({
  group,
  index,
  isLastStep,
}: UseHandleOnboardingEventsParams): UseHandleOnboardingEventsReturn => {
  const dispatch = useDispatch();

  const beforePrev = (): EventHookResult => {
    if (group === OnboardingGroup.SETTINGS) {
      if (index === 1) {
        // when the user clicks "back" in
        // the second step of the settings onboarding, close the drawer
        dispatch(setIsSettingsDrawerOpen(false));

        // add a delay to the animation so that the drawer has time to close
        // tip: this comes from Drawer.module.scss (--transition-regular)
        return { delay: 400 };
      }

      if (isLastStep) {
        // when the user clicks "back" in
        // the last step of the settings onboarding, close the translations view
        dispatch(setSettingsView(SettingsView.Body));

        setTimeout(() => {
          const el = document.getElementById('settings-drawer-container');

          // scroll to the bottom of the settings view
          if (el) el.scrollTop = el.scrollHeight;
        }, 0);

        return { delay: 1 };
      }
    }

    if (group === OnboardingGroup.READING_EXPERIENCE) {
      if (index === 4) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_BEFORE_CHOOSING_RECITER_FROM_LIST));
        return { automaticallyProceed: false };
      }

      if (index === 3) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_BEFORE_RECITER_LIST_ITEM_CLICK));
        return { automaticallyProceed: false };
      }
    }

    return {};
  };

  const beforeNext = (): EventHookResult => {
    if (group === OnboardingGroup.SETTINGS) {
      if (isLastStep) {
        // when the user clicks "finish" in
        // the last step of the settings onboarding, close the drawer
        dispatch(setIsSettingsDrawerOpen(false));
        // reset the drawer to the body view in-case the user re-opens the settings tour again after having finished it.
        dispatch(setSettingsView(SettingsView.Body));
        return {};
      }

      if (index === 0) {
        // if the user clicks "next" in the first step of the settings onboarding,
        // open the drawer
        dispatch(setIsSettingsDrawerOpen(true));

        // we'll let the drawer handle the proceeding when it's done opening
        return { automaticallyProceed: false };
      }

      if (index === 8) {
        // if the user clicks "next" in translations step,
        // switch to translations view
        setTimeout(() => {
          dispatch(setSettingsView(SettingsView.Translation));
        }, 10);

        // we'll let the translations view handle the proceeding when it's done opening
        return { automaticallyProceed: true };
      }
    }

    if (group === OnboardingGroup.READING_EXPERIENCE) {
      // if the user clicks next when the step is play audio of an Ayah
      if (index === 1) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_AFTER_PLAY_AUDIO_CLICK));
        return { automaticallyProceed: false };
      }
      // if the user clicks next when the step is clicking on the dot icon to open the audio player settings menu
      if (index === 2) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_AFTER_AUDIO_PLAYER_TRIGGER));
        return { automaticallyProceed: false };
      }
      // if the user clicks next when the step is clicking the reciters menu item in the audio player settings menu
      if (index === 3) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_AFTER_RECITER_LIST_ITEM_CLICK));
        return { automaticallyProceed: false };
      }
      // if the user clicks next when the step is choosing a reciter from the reciters list
      if (index === 4) {
        window.dispatchEvent(new Event(OnboardingEvent.STEP_AFTER_CHOOSING_RECITER_FROM_LIST));
        return { automaticallyProceed: false };
      }
    }

    return {};
  };

  const beforeSkip = (): EventHookResult => {
    return {};
  };

  return {
    beforePrev,
    beforeNext,
    beforeSkip,
  };
};

export default useHandleOnboardingEvents;
