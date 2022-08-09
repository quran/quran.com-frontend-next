/* eslint-disable max-lines */
import { useState } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { GetStaticPaths, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import CopyIcon from '../../../../public/icons/copy.svg';
import DownloadIcon from '../../../../public/icons/download.svg';
import PauseIcon from '../../../../public/icons/pause.svg';
import PlayIcon from '../../../../public/icons/play-arrow.svg';
import ReaderIcon from '../../../../public/icons/reader.svg';
import layoutStyle from '../../index.module.scss';

import styles from './chapterId.module.scss';

import { getChapterAudioData, getChapterIdBySlug, getReciterData } from 'src/api';
import { download } from 'src/components/AudioPlayer/Buttons/DownloadAudioButton';
import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import DataContext from 'src/contexts/DataContext';
import { playFrom, selectAudioData, selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { makeCDNUrl } from 'src/utils/cdn';
import { getChapterData, getAllChaptersData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import {
  getCanonicalUrl,
  getReciterChapterNavigationUrl,
  getSurahNavigationUrl,
} from 'src/utils/navigation';
import { getCurrentPath } from 'src/utils/url';
import { isValidChapterId } from 'src/utils/validator';
import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';
import Reciter from 'types/Reciter';

type ShareRecitationPageProps = {
  selectedReciter: Reciter;
  selectedChapter: Chapter;
  chaptersData: ChaptersData;
};
const RecitationPage = ({
  selectedReciter,
  selectedChapter,
  chaptersData,
}: ShareRecitationPageProps) => {
  const { t, lang } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();
  const router = useRouter();
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const isAudioPlaying = useSelector(selectIsPlaying);
  const currentAudioData = useSelector(selectAudioData, shallowEqual);

  const onPlayAudioClicked = () => {
    dispatch(
      playFrom({
        chapterId: Number(selectedChapter.id),
        reciterId: selectedReciter.id,
        timestamp: 0,
      }),
    );
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

  const isCurrentlyPlayingThisChapter =
    isAudioPlaying && currentAudioData.chapterId === Number(selectedChapter.id);

  return (
    <DataContext.Provider value={chaptersData}>
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
          <img
            className={styles.reciterImage}
            alt={selectedReciter.translatedName.name}
            src={makeCDNUrl(selectedReciter.profilePicture)}
          />
          <div>
            <div className={styles.chapterName}>
              {selectedChapter.id}. {selectedChapter.transliteratedName}
            </div>
            <div className={styles.reciterName}>{selectedReciter.translatedName.name}</div>
          </div>
          <div className={styles.actionsContainer}>
            {isCurrentlyPlayingThisChapter ? (
              <Button
                onClick={() => triggerPauseAudio()}
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
    </DataContext.Provider>
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
