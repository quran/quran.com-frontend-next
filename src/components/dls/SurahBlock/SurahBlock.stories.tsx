import SurahBlock from './SurahBlock';

export default {
  title: 'dls/SurahBlock',
  component: SurahBlock,
};

export const Example = () => (
  <div style={{ maxWidth: 400 }}>
    <SurahBlock
      surahName="An-Nas"
      translatedSurahName="Mankind"
      chapterId={114}
      surahNumber={114}
    />
  </div>
);
