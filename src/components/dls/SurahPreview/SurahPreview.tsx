import SurahPreviewBlock from './SurahPreviewBlock';
import SurahPreviewRow from './SurahPreviewRow';

export enum SurahPreviewDisplay {
  Block = 'block',
  Row = 'row',
}

type SurahProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  chapterId: number;
  display?: SurahPreviewDisplay;
  description?: string;
};

const SurahPreview = ({
  chapterId,
  surahName,
  surahNumber,
  translatedSurahName,
  description,
  display = SurahPreviewDisplay.Block,
}: SurahProps) => {
  if (display === SurahPreviewDisplay.Block) {
    return (
      <SurahPreviewBlock
        chapterId={chapterId}
        surahName={surahName}
        surahNumber={surahNumber}
        translatedSurahName={translatedSurahName}
        description={description}
      />
    );
  }

  if (display === SurahPreviewDisplay.Row) {
    return (
      <SurahPreviewRow
        chapterId={chapterId}
        surahName={surahName}
        surahNumber={surahNumber}
        translatedSurahName={translatedSurahName}
        description={description}
      />
    );
  }

  throw new Error('display must be either block or row');
};

export default SurahPreview;
