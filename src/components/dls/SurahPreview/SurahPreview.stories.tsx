import SurahPreview, { SurahPreviewDisplay } from './SurahPreview';

export default {
  title: 'dls/SurahPreview',
  component: SurahPreview,
};

const Template = (args) => {
  return (
    <div style={{ maxWidth: 400 }}>
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

export const Block = Template.bind({});
Block.args = {
  display: SurahPreviewDisplay.Block,
  description: 'Ayah 3',
};

export const Row = Template.bind({});
Row.args = {
  display: SurahPreviewDisplay.Row,
  description: '4 Ayahs',
};
