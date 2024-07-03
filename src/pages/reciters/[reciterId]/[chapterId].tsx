/* eslint-disable max-lines */
import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../../index.module.scss';

import styles from './chapterId.module.scss';

import { getChapterAudioData, getChapterIdBySlug, getReciterData } from '@/api';
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
import { selectCurrentAudioReciterId } from '@/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ShareRecitationPageProps = {
  selectedReciter: Reciter;
  selectedChapter: Chapter;
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.reciterImage}
            alt={selectedReciter.translatedName.name}
            src={makeCDNUrl(selectedReciter.profilePicture)}
          />
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

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const reciterId = params.reciterId as string;
    let chapterId = params.chapterId as string;
    const isValidId = isValidChapterId(chapterId);
    // if it's not a valid number or a number that exceed 114 or below 1
    if (!isValidId) {
      const sluggedChapterId = await getChapterIdBySlug(chapterId, locale);
      // if it's not a valid number nor a valid slug
      if (!sluggedChapterId) {
        return { notFound: true };
      }
      chapterId = sluggedChapterId;
    }

    const reciterData = await getReciterData(reciterId, locale);
    const chaptersData = await getAllChaptersData(locale);
    const chapterData = await getChapterData(chaptersData, chapterId);

    if (!reciterData || !chapterData) {
      return { notFound: true };
    }

    return {
      props: {
        chaptersData,
        selectedReciter: reciterData.reciter,
        selectedChapter: { ...chapterData, id: chapterId },
      },
    };
    // eslint-disable-next-line max-lines
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});
