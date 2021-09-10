import AlertModal from './AlertModal';

export default {
  title: 'AudioPlayer/Alert',
  component: AlertModal,
};

export const Preview = () => (
  <AlertModal
    open
    currentChapterName="Al Baqarah"
    nextChapterName="Ali Imran"
    onContinue={() => {
      // logic to continue Al Baqarah
    }}
    onStartOver={() => {
      // logic to play Ali Imran
    }}
  />
);
