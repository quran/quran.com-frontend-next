export interface RepeatSettingsPreference {
  from?: string;
  to?: string;
  repeatRange?: number | string | null;
  repeatEachVerse?: number | string | null;
  delayMultiplier?: number | string | null;
}

type AudioState = {
  enableAutoScrolling: boolean;
  isDownloadingAudio: boolean;
  showTooltipWhenPlayingAudio: boolean;
  repeatSettings?: RepeatSettingsPreference;
};

export default AudioState;
