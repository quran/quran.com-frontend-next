export {};

// extends the global window object
declare global {
  interface Window {
    audioPlayerEl: HTMLAudioElement; // Global audio player element reference
    quranReaderObserver: IntersectionObserver;
    wordByWordAudioPlayerEl: HTMLAudioElement;
    webkitAudioContext: typeof AudioContext;
    gtag: any;
    isPersistGateHydrated?: boolean;
  }
}
