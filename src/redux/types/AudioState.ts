export type JsonNumberString = `${number}`;

export interface RepeatSettingsPreference {
  from?: string;
  to?: string;
  repeatRange?: number | JsonNumberString | null;
  repeatEachVerse?: number | JsonNumberString | null;
  delayMultiplier?: number | JsonNumberString | null;
}

export type AudioState = {
  enableAutoScrolling: boolean;
  isDownloadingAudio: boolean;
  showTooltipWhenPlayingAudio: boolean;
  repeatSettings?: RepeatSettingsPreference;
};
