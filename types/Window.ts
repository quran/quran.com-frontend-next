import { Options } from 'src/components/dls/Toast/Toast';

export {};

// extends the global window object
declare global {
  interface Window {
    audioPlayerEl: HTMLAudioElement; // Global audio player element reference
    quranReaderObserver: IntersectionObserver;
    wordByWordAudioPlayerEl: HTMLAudioElement;
    webkitAudioContext: typeof AudioContext;
    gtag: any;
    toast: (content: React.ReactNode, options: Options) => void;
  }
}
