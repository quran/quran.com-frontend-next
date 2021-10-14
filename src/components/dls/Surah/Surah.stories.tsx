import Surah from './Surah';

export default {
  title: 'dls/Surah',
  component: Surah,
};

export const Example = () => (
  <div style={{ maxWidth: 400 }}>
    <Surah
      surahName="Al Ikhlas"
      translatedSurahName="The Sincerity"
      chapterId={112}
      surahNumber={112}
      verseCount={4}
    />
  </div>
);
