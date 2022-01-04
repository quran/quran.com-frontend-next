import SurahAudioMismatchModal from './SurahAudioMismatchModal';

export default {
  title: 'AudioPlayer/Alert',
  component: SurahAudioMismatchModal,
  argTypes: {
    isOpen: {
      defaultValue: true,
      control: 'boolean',
    },
    currentAudioChapter: {
      defaultValue: 'Al-Baqarah',
      control: 'text',
    },
    currentReadingChapter: {
      defaultValue: "Ali 'Imran",
      control: 'text',
    },
  },
};

const Template = (args) => (
  <SurahAudioMismatchModal
    isOpen
    currentAudioChapter="Al-Baqarah"
    currentReadingChapter="Ali 'Imran"
    onContinue={() => {
      // logic to continue Al Baqarah
    }}
    onStartOver={() => {
      // logic to play Ali Imran
    }}
    {...args}
  />
);

export const Preview = Template.bind({});
