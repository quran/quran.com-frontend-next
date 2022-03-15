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

import { getChapterAudioData, getReciterData } from 'src/api';
import { download } from 'src/components/AudioPlayer/Buttons/DownloadAudioButton';
import { triggerPauseAudio } from 'src/components/AudioPlayer/EventTriggers';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { playFrom, selectAudioData, selectIsPlaying } from 'src/redux/slices/AudioPlayer/state';
import { makeCDNUrl } from 'src/utils/cdn';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import { getCurrentPath } from 'src/utils/url';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ShareRecitationPageProps = {
  selectedReciter: Reciter;
  selectedChapter: Chapter;
};
const RecitationPage = ({ selectedReciter, selectedChapter }: ShareRecitationPageProps) => {
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
    const path = getCurrentPath(lang);
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
  );
};

export default RecitationPage;

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const reciterId = params.reciterId as string;
    const chapterId = params.chapterId as string;

    const reciterData = await getReciterData(reciterId, locale);
    const chapterData = await getChapterData(chapterId, locale);

    if (!reciterData || !chapterData) {
      return { notFound: true };
    }

    return {
      props: {
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
