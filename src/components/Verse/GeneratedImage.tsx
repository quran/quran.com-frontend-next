import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';

import styles from './GeneratedImage.module.scss';

import ImageGeneratorVerseText from '@/components/Verse/PlainVerseText/ImageGeneratorVerseText';
import Button, { ButtonType } from '@/dls/Button/Button';
import { QuranFont } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getVerseWords } from '@/utils/verse';

const NODE_ID = 'GENERATAED-IMAGE';
type Props = {
  verse: Verse;
};

const GeneratedImage = ({ verse }: Props) => {
  const handleDownloadImage = () => {
    const element = document.getElementById(NODE_ID);
    if (element) {
      htmlToImage.toPng(element).then((dataUrl) => {
        download(dataUrl, 'wallpaper.png');
      });
    }
  };

  const backgroundImage = (
    <img
      alt="background"
      className={styles.backgroundImage}
      // width={1000}
      // height={1778}
      src="https://ayah.one/wallpaper-background-1.png" // TODO: replace the image url
    />
  );

  const arabicText = (
    <div className={styles.arabicText}>
      <ImageGeneratorVerseText quranFont={QuranFont.QPCHafs} words={getVerseWords(verse)} />
    </div>
  );

  const backgroundOverlay = <div className={styles.backgroundOverlay} />;

  const translationText = verse.translations[0].text;
  const translation = <div className={styles.translationText}>{translationText}</div>;

  // TODO: include surah name
  const verseKeyFootnote = <div className={styles.verseKeyFootnote}>Quran {verse.verseKey}</div>;

  return (
    <div>
      <div id={NODE_ID} className={styles.container}>
        {backgroundImage}
        {backgroundOverlay}
        <div className={styles.content}>
          {arabicText}
          {translation}
          {verseKeyFootnote}
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <Button type={ButtonType.Primary} onClick={handleDownloadImage}>Download</Button>
        <Button type={ButtonType.Success} onClick={handleDownloadImage}>Share</Button>
      </div>
    </div>
  );
};

export default GeneratedImage;
