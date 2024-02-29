import { useContext, useEffect, useState } from 'react';

import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import useTranslation from 'next-translate/useTranslation';

import styles from './GeneratedImage.module.scss';

import ImageGeneratorVerseText from '@/components/Verse/PlainVerseText/ImageGeneratorVerseText';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonType } from '@/dls/Button/Button';
import { QuranFont } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getVerseWords } from '@/utils/verse';

const NODE_ID = 'GENERATAED-IMAGE';
type Props = {
  verse: Verse;
};

const GeneratedImage = ({ verse }: Props) => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if ('share' in window.navigator) {
      setCanShare(true);
    }
  }, []);

  const surah = chaptersData[verse.chapterId];

  const handleDownloadImage = () => {
    const element = document.getElementById(NODE_ID);
    if (element) {
      htmlToImage.toPng(element).then((dataUrl) => {
        download(dataUrl, 'wallpaper.png');
      });
    }
  };

  const handleShareImage = () => {
    const element = document.getElementById(NODE_ID);
    html2canvas(element).then(async (canvas) => {
      const url = canvas.toDataURL('image/jpg', 1);
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'konsumen-bijak.png', {
        type: blob.type,
      });

      window.navigator
        .share({
          files: [file],
        })
        .catch(() => console.log('share: either cancelled or error'));
    });
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
  const verseKeyCitation = (
    <div className={styles.verseKeyCitation}>
      {t('share-modal.ayah-citation', {
        surahNumber: verse.chapterId,
        ayahNumber: verse.verseNumber,
        surahName: surah.transliteratedName,
      })}
    </div>
  );

  return (
    <div>
      <div id={NODE_ID} className={styles.container}>
        {backgroundImage}
        {backgroundOverlay}
        <div className={styles.content}>
          {arabicText}
          {translation}
          {verseKeyCitation}
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <Button type={ButtonType.Primary} onClick={handleDownloadImage}>
          {t('share-modal.download')}
        </Button>

        {canShare && (
          <Button type={ButtonType.Success} onClick={handleShareImage}>
            {t('share-modal.share')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GeneratedImage;
