import SurahPreview, { SurahPreviewDisplay } from './SurahPreview';

export default {
  title: 'dls/SurahPreview',
  component: SurahPreview,
  argTypes: {
    display: {
      control: {
        type: 'select',
      },
      defaultValue: SurahPreviewDisplay.Block,
      options: Object.values(SurahPreviewDisplay),
    },
    surahNumber: {
      control: {
        type: 'number',
      },
      defaultValue: 114,
    },
    surahName: {
      control: {
        type: 'text',
      },
      defaultValue: 'An-Nas',
    },
    translatedSurahName: {
      control: {
        type: 'text',
      },
      defaultValue: 'Mankind',
    },
  },
};

const Template = (args) => {
  return (
    <div style={{ maxWidth: 400 }} className="previewWrapper">
      <SurahPreview
        verseCount={4}
        surahName="An-Nas"
        translatedSurahName="Mankind"
        chapterId={114}
        surahNumber={114}
        {...args}
      />
    </div>
  );
};

export const Preview = Template.bind({});
