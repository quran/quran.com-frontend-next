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
    repeatSameAyah: "";
    sendVerseRepeatFinished: "";
    updateVerseTiming: "UPDATE_VERSE_TIMING";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    verseEnded: "TIMESTAMP_UPDATED";
    verseRepeatOnProgress: "";
  };
  eventsCausingDelays: {};
  matchesStates: "finished" | "inProgress" | "verseEnded";
  tags: never;
}
