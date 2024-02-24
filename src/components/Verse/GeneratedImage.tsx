import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';

import styles from './GeneratedImage.module.scss';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import Button from '@/dls/Button/Button';
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
      <PlainVerseText words={getVerseWords(verse)} />
    </div>
  );

  return (
    <div>
      <div id={NODE_ID} className={styles.container}>
        {backgroundImage}
        {arabicText}
      </div>
      <Button onClick={handleDownloadImage}>Download</Button>
    </div>
  );
};

export default GeneratedImage;
