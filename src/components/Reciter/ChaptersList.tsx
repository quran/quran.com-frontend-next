import { useState } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CopyLinkIcon from '../../../public/icons/copy-link.svg';
import DownloadIcon from '../../../public/icons/download.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { download } from '../AudioPlayer/Buttons/DownloadAudioButton';
import ChapterIconContainer from '../chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';
import { ToastStatus, useToast } from '../dls/Toast/Toast';

import styles from './ChapterList.module.scss';

import { getChapterAudioData } from 'src/api';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { getWindowOrigin } from 'src/utils/url';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ChaptersListProps = {
  filteredChapters: Chapter[];
  selectedReciter: Reciter;
};

const ChaptersList = ({ filteredChapters, selectedReciter }: ChaptersListProps) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [currentlyDownloadChapterAudioId, setCurrentlyDownloadChapterAudioId] = useState(null);

  const onPlayChapterClicked = (chapterId: string) => {
    const selectedChapterId = chapterId;

    logEvent('reciter_page_chapter_played', {
      stationId: selectedChapterId,
    });

    dispatch(
      playFrom({
        chapterId: Number(selectedChapterId),
        reciterId: Number(selectedReciter.id),
        timestamp: 0,
      }),
    );
  };

  const onCopyUrlClicked = (chapterId) => {
    logButtonClick('reciter_page_chapter_url_copy');
    const origin = getWindowOrigin();
    clipboardCopy(`${origin}/${chapterId}`).then(() => {
      toast(t('common:shared'), { status: ToastStatus.Success });
    });
  };

  const onAudioDownloadClicked = async (chapterId) => {
    logButtonClick('reciter_page_chapter_audio_download');
    const audioData = await getChapterAudioData(Number(selectedReciter.id), Number(chapterId));

    setCurrentlyDownloadChapterAudioId(chapterId);
    download(audioData.audioUrl, () => {
      setCurrentlyDownloadChapterAudioId(null);
    });
  };

  return (
    <div className={styles.chapterListContainer}>
      {filteredChapters.map((chapter) => (
        <div
          key={chapter.id}
          className={styles.chapterListItem}
          role="button"
          tabIndex={0}
          onKeyPress={() => onPlayChapterClicked(chapter.id.toString())}
          onClick={() => onPlayChapterClicked(chapter.id.toString())}
        >
          <div className={styles.chapterInfoContainer}>
            <div className={styles.playIconWrapper}>
              <span className={styles.playIcon}>
                <PlayIcon />
              </span>
            </div>
            <div>
              <div className={styles.chapterName}>
                {chapter.id}. {chapter.transliteratedName}
              </div>
              <span className={styles.chapterIconContainer}>
                <ChapterIconContainer chapterId={chapter.id.toString()} hasSurahPrefix={false} />
              </span>
            </div>
          </div>
          <div className={styles.actionsContainer}>
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              shape={ButtonShape.Circle}
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrlClicked(chapter.id);
              }}
            >
              <CopyLinkIcon />
            </Button>
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              onClick={async (e) => {
                e.stopPropagation();
                onAudioDownloadClicked(chapter.id);
              }}
            >
              {currentlyDownloadChapterAudioId === chapter.id ? (
                <Spinner size={SpinnerSize.Small} />
              ) : (
                <DownloadIcon />
              )}
            </Button>
          </div>
        </div>
      ))}
      <div />
    </div>
  );
};

export default ChaptersList;
