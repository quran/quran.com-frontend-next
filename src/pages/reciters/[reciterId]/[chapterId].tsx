/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../../index.module.scss';

import styles from './chapterId.module.scss';

import { getAvailableReciters, getChapterAudioData } from '@/api';
import { download } from '@/components/AudioPlayer/Buttons/DownloadAudioButton';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Button, { ButtonType } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CopyIcon from '@/icons/copy.svg';
import DownloadIcon from '@/icons/download.svg';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import ReaderIcon from '@/icons/reader.svg';
import { makeCDNUrl } from '@/utils/cdn';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getCanonicalUrl,
  getReciterChapterNavigationUrl,
  getSurahNavigationUrl,
} from '@/utils/navigation';
import { getCurrentPath } from '@/utils/url';
import { isValidChapterId } from '@/utils/validator';
import withSsrRedux from '@/utils/withSsrRedux';
import { selectCurrentAudioReciterId } from '@/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ShareRecitationPageProps = {
  selectedReciter?: Reciter;
  selectedChapter?: Chapter;
};

const RecitationPage = ({ selectedReciter, selectedChapter }: ShareRecitationPageProps) => {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const currentSurah = useSelector(audioService, (state) => state.context.surah);
  const currentReciterId = useSelector(audioService, selectCurrentAudioReciterId);

  const isCurrentlyPlayingThisChapter =
    isAudioPlaying &&
    currentSurah === Number(selectedChapter.id) &&
    currentReciterId === selectedReciter.id;

  const onPlayAudioClicked = () => {
    audioService.send({
      type: 'PLAY_SURAH',
      surah: Number(selectedChapter.id),
      reciterId: selectedReciter.id,
    });
  };

  const onCopyLinkClicked = () => {
    logButtonClick('share-recitation-copy-link');
    const path = getCurrentPath();
    if (origin) {
      clipboardCopy(path).then(() => {
        toast(t('common:shared'), { status: ToastStatus.Success });
      });
    }
  };

  const onReadClicked = () => {
    logButtonClick('share-recitation-read');
    router.push(getSurahNavigationUrl(selectedChapter.id));
  };

  const onDownloadClicked = async () => {
    setIsDownloadingAudio(true);
    logButtonClick('share-recitation-download');
    const audioData = await getChapterAudioData(
      Number(selectedReciter.id),
      Number(selectedChapter.id),
    );

    download(audioData.audioUrl, () => {
      setIsDownloadingAudio(false);
    });
  };

  return (
    <>
      <NextSeoWrapper
        title={`${selectedReciter.translatedName.name} - ${selectedChapter.transliteratedName}`}
        description={t('reciter:reciter-chapter-desc', {
          surahName: selectedChapter.transliteratedName,
          reciterName: selectedReciter.translatedName.name,
        })}
        canonical={getCanonicalUrl(
          lang,
          getReciterChapterNavigationUrl(selectedReciter.id.toString(), selectedChapter.slug),
        )}
      />
      <div className={classNames(layoutStyle.flow)}>
        <div className={classNames(layoutStyle.flowItem, styles.container)}>
          <div className={styles.reciterImage}>
            <Image
              src={makeCDNUrl(selectedReciter.profilePicture)}
              alt={selectedReciter.translatedName.name}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              className={styles.reciterImageContent}
              priority
            />
          </div>
          <div>
            <div className={styles.chapterName}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              {selectedChapter.id}. {selectedChapter.transliteratedName}
            </div>
            <div className={styles.reciterName}>{selectedReciter.translatedName.name}</div>
          </div>
          <div className={styles.actionsContainer}>
            {isCurrentlyPlayingThisChapter ? (
              <Button
                onClick={() => audioService.send('TOGGLE')}
                prefix={<PauseIcon />}
                className={styles.playButton}
              >
                {t('common:audio.player.pause-audio')}
              </Button>
            ) : (
              <Button
                className={styles.playButton}
                onClick={onPlayAudioClicked}
                prefix={<PlayIcon />}
                shouldFlipOnRTL={false}
              >
                {t('common:audio.player.play-audio')}
              </Button>
            )}

            <div className={styles.secondaryActionsContainer}>
              <Button
                className={styles.secondaryAction}
                onClick={onReadClicked}
                prefix={<ReaderIcon />}
                type={ButtonType.Secondary}
              >
                {t('reciter:read')}
              </Button>
              <Button
                className={styles.secondaryAction}
                onClick={onCopyLinkClicked}
                prefix={<CopyIcon />}
                type={ButtonType.Secondary}
              >
                {t('reciter:copy-link')}
              </Button>
              <Button
                className={styles.secondaryAction}
                onClick={onDownloadClicked}
                prefix={isDownloadingAudio ? <Spinner /> : <DownloadIcon />}
                type={ButtonType.Secondary}
              >
                {t('common:audio.player.download')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecitationPage;

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/reciters/[reciterId]/[chapterId]',
  async (context) => {
    const { params, locale } = context;
    const reciterId = String(params.reciterId);
    const chapterId = String(params.chapterId);

    if (!isValidChapterId(chapterId)) {
      return { notFound: true };
    }

    try {
      const { reciters } = await getAvailableReciters(locale, []);
      const selectedReciter = reciters.find((reciter) => reciter.id === Number(reciterId));
      if (!selectedReciter) {
        return { notFound: true };
      }

      const chaptersData = await getAllChaptersData(locale);
      const selectedChapter = getChapterData(chaptersData, chapterId);

      return {
        props: {
          selectedReciter,
          selectedChapter,
        },
      };
    } catch (error) {
      return { notFound: true };
    }
  },
);
