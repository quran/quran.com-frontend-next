// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
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
    forwardtimestampToVerseActor: "TIMESTAMP_UPDATED";
    repeatCycle: "";
    repeatNextAyah: "REPEAT_NEXT_AYAH";
    repeatPreviousAyah: "REPEAT_PREV_AYAH";
    repeatSameAyah: "REPEAT_SAME_AYAH";
    repeatSelectedAyah: "REPEAT_SELECTED_AYAH";
    sendRangeRepeatFinished: "";
    spawnNextAyahActor: "VERSE_REPEAT_FINISHED";
    spawnVerseCycleActor: "" | "xstate.init";
    updateVerseTimings: "UPDATE_VERSE_TIMINGS";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    rangeCycleFinished: "";
    rangeCycleOnProgress: "";
    rangeEnded: "VERSE_REPEAT_FINISHED";
  };
  eventsCausingDelays: {};
  matchesStates: "finished" | "inProgress" | "rangeEnded";
  tags: never;
}
