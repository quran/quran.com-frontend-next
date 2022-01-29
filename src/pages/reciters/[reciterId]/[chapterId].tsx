import { useState } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { GetStaticPaths, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import CopyIcon from '../../../../public/icons/copy.svg';
import DownloadIcon from '../../../../public/icons/download.svg';
import LinkIcon from '../../../../public/icons/east.svg';
import PlayIcon from '../../../../public/icons/play-arrow.svg';
import layoutStyle from '../../index.module.scss';

import styles from './chapterId.module.scss';

import { getChapterAudioData, getReciterData } from 'src/api';
import { download } from 'src/components/AudioPlayer/Buttons/DownloadAudioButton';
import Button, { ButtonType } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { getImageCDNPath } from 'src/utils/api';
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
const ShareRecitationPage = ({ selectedReciter, selectedChapter }: ShareRecitationPageProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();
  const router = useRouter();
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
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
    logButtonClick('share-recitation__copy-link');
    const path = getCurrentPath();
    if (origin) {
      clipboardCopy(path).then(() => {
        toast(t('common:shared'), { status: ToastStatus.Success });
      });
    }
  };

  const onReadClicked = () => {
    logButtonClick('share-recitation__read');
    router.push(getSurahNavigationUrl(selectedChapter.id));
  };

  const onDownloadClicked = async () => {
    setIsDownloadingAudio(true);
    logButtonClick('share-recitation__download');
    const audioData = await getChapterAudioData(
      Number(selectedReciter.id),
      Number(selectedChapter.id),
    );

    download(audioData.audioUrl, () => {
      setIsDownloadingAudio(false);
    });
  };

  return (
    <div className={classNames(layoutStyle.flow)}>
      <div className={classNames(layoutStyle.flowItem, styles.container)}>
        <img
          className={styles.reciterImage}
          alt={selectedReciter.name}
          src={getImageCDNPath(selectedReciter.profilePicture)}
        />
        <div>
          <div className={styles.chapterName}>{selectedChapter.transliteratedName}</div>
          <div className={styles.reciterName}>{selectedReciter.name}</div>
        </div>
        <div className={styles.actionsContainer}>
          <Button className={styles.playButton} onClick={onPlayAudioClicked} prefix={<PlayIcon />}>
            {t('common:word-click.play-audio')}
          </Button>
          <div className={styles.secondaryActionsContainer}>
            <Button
              className={styles.secondaryAction}
              onClick={onReadClicked}
              prefix={<LinkIcon />}
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

export default ShareRecitationPage;

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const reciterId = params.reciterId as string;
    const chapterId = params.chapterId as string;

    const reciterData = await getReciterData(reciterId);
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
