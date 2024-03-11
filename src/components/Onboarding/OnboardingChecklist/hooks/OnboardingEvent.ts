/**
 * List of events that can be dispatched to control the onboarding checklist
 * manually and give control to the component that is being on-boarded.
 * Events are triggered from @see useHandleOnboardingEvents.ts
 */
enum OnboardingEvent {
  STEP_AFTER_CHOOSING_RECITER_FROM_LIST = 'stepAfterChoosingReciterFromList',
  STEP_AFTER_PLAY_AUDIO_CLICK = 'stepAfterPlayAudioClick',
  STEP_AFTER_AUDIO_PLAYER_TRIGGER = 'stepAfterAudioPlayerTrigger',
  STEP_AFTER_RECITER_LIST_ITEM_CLICK = 'stepAfterReciterListItemClick',

  STEP_BEFORE_RECITER_LIST_ITEM_CLICK = 'stepBeforeReciterListItemClick',
  STEP_BEFORE_CHOOSING_RECITER_FROM_LIST = 'stepBeforeChoosingReciterFromList',
}

export default OnboardingEvent;
