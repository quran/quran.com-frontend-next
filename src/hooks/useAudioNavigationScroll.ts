import { useContext, useEffect } from 'react';

import { QuranReaderDataType } from '@/types/QuranReader';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

type AudioNavigationHandler = (ayahNumber: number) => void;

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
      if (state.event.type === 'NEXT_AYAH' || state.event.type === 'PREV_AYAH') {
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
