import SurahAudioMismatchModal from './SurahAudioMismatchModal';

export default {
  title: 'AudioPlayer/Alert',
  component: SurahAudioMismatchModal,
};

export const Preview = () => (
  <SurahAudioMismatchModal
    open
    currentAudioChapter="Al-Baqarah"
    currentReadingChapter="Ali 'Imran"
    onContinue={() => {
      // logic to continue Al Baqarah
    }}
    onStartOver={() => {
      // logic to play Ali Imran
    }}
  />
);
