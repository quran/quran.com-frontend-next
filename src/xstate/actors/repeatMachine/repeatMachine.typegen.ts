// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    forwardToRangeCycleActor: "TIMESTAMP_UPDATED";
    repeatAyah: "REPEAT_AYAH";
    repeatNextAyah: "REPEAT_NEXT_AYAH";
    repeatPreviousAyah: "REPEAT_PREV_AYAH";
    repeatSelectedAyah: "REPEAT_SELECTED_AYAH";
    sendRepeatFinished: "RANGE_REPEAT_FINISHED" | "REPEAT_SELECTED_AYAH";
    spawnRangeCycleActor: "xstate.init";
    updateVerseTimings: "UPDATE_VERSE_TIMINGS";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    selectedAyahIsNotInRange: "REPEAT_SELECTED_AYAH";
  };
  eventsCausingDelays: {};
  matchesStates: "finished" | "inProgress";
  tags: never;
}
