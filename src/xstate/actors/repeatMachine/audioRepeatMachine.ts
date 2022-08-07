/* eslint-disable react-func/max-lines-per-function */
import { createMachine, assign, sendParent } from 'xstate';
import { pure } from 'xstate/lib/actions';

const createRepeaetContext = (_from: any, to: any) => {
  return {
    verseDuration: 4000,
    repeatSettings: {
      delayMultiplier: 1,
      repeatVerseCount: 2,
      repeatRangeCount: 2,
      repeatRangeFrom: 1,
      repeatRangeTo: 2,
    },
    repeatProgress: {
      repeatRangeCount: 0,
      repeatVerseCount: 0,
    },
  };
};
type RepeatContext = ReturnType<typeof createRepeaetContext>;

type VerseEndedEvent = { type: 'VERSE_ENDED'; verseDuration: number; ayahNumber: number };
const setPlaybackRate = pure((context: RepeatContext, event: VerseEndedEvent) => {
  const actions = [
    sendParent('TOGGLE'), // pause the audio
    assign({
      verseDuration: event.verseDuration,
    }),
  ];

  let nextRepeatVerseCount;
  let nextRepeatRangeCount = context.repeatProgress.repeatRangeCount;
  if (context.repeatProgress.repeatVerseCount < context.repeatSettings.repeatVerseCount) {
    nextRepeatVerseCount = context.repeatProgress.repeatVerseCount + 1;
    actions.push(sendParent('PREV_AYAH'));
  } else {
    nextRepeatVerseCount = 1; // reset the repeatVerseCount

    if (event.ayahNumber === context.repeatSettings.repeatRangeTo) {
      if (context.repeatProgress.repeatRangeCount < context.repeatSettings.repeatRangeCount) {
        nextRepeatRangeCount = context.repeatProgress.repeatRangeCount + 1;
        actions.push(
          sendParent({
            type: 'PLAY_AYAH',
            ayahNumber: context.repeatSettings.repeatRangeFrom,
            surah: 114, // hardcode for testing
          }),
        );
      } else {
        nextRepeatRangeCount = 1; // reset the repeatRangeCount
        actions.push(sendParent({ type: 'REPEAT_ENDED' }));
      }
    }
  }

  const updateRepeatProgress = assign({
    repeatProgress: {
      repeatVerseCount: nextRepeatVerseCount,
      repeatRangeCount: nextRepeatRangeCount,
    },
  });

  actions.push(updateRepeatProgress);
  return actions;
});

const createAudioRepeatMachine = (from, to) =>
  createMachine(
    {
      id: 'audioRepeatMachine',
      context: createRepeaetContext(from, to),
      initial: 'repeatingVerse',
      states: {
        repeatingVerse: {
          on: {
            VERSE_ENDED: {
              target: 'delaying',
              actions: setPlaybackRate,
            },
          },
        },
        delaying: {
          after: {
            GAP_BETWEEN_VERSE: {
              target: 'repeatingVerse',
              actions: sendParent('TOGGLE'),
            },
          },
        },
      },
    },
    {
      delays: {
        GAP_BETWEEN_VERSE: (context) => {
          return context.verseDuration * context.repeatSettings.delayMultiplier;
        },
      },
    },
  );

export default createAudioRepeatMachine;
