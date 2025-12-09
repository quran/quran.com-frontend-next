import { useContext, useEffect } from 'react';

import { QuranReaderDataType } from '@/types/QuranReader';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

type AudioNavigationHandler = (ayahNumber: number) => unknown;

/**
 * The audio service machine (see `src/xstate/actors/audioPlayer/audioPlayerMachine.ts`) uses raw string event names;
 * introducing a shared enum there would require wider changes (10-20 file changes), so we scope the enum here for safer comparisons.
 */
enum AudioNavigationEvent {
  NextAyah = 'NEXT_AYAH',
  PrevAyah = 'PREV_AYAH',
}

/**
 * Shared hook that subscribes to audio NEXT_AYAH/PREV_AYAH events
 * and triggers the provided navigate handler when the ayah number is valid.
 */
const useAudioNavigationScroll = (
  quranReaderDataType: QuranReaderDataType,
  onNavigate: AudioNavigationHandler,
) => {
  const audioService = useContext(AudioPlayerMachineContext);

  useEffect(() => {
    if (!audioService || quranReaderDataType !== QuranReaderDataType.Chapter) {
      return undefined;
    }

    const subscription = audioService.subscribe((state) => {
      if (
        state.event.type === AudioNavigationEvent.NextAyah ||
        state.event.type === AudioNavigationEvent.PrevAyah
      ) {
        const { ayahNumber } = state.context;
        if (!Number.isInteger(ayahNumber) || ayahNumber <= 0) return;
        onNavigate(ayahNumber);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [audioService, quranReaderDataType, onNavigate]);
};

export default useAudioNavigationScroll;
