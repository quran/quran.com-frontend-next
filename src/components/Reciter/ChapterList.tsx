/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CopyLinkIcon from '../../../public/icons/copy-link.svg';
import DownloadIcon from '../../../public/icons/download.svg';
import { download } from '../AudioPlayer/Buttons/DownloadAudioButton';
import ChapterIconContainer from '../chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';
import { ToastStatus, useToast } from '../dls/Toast/Toast';

import styles from './ChapterList.module.scss';

import { getChapterAudioData } from 'src/api';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { getRandomChapterId } from 'src/utils/chapter';
import { logEvent } from 'src/utils/eventLogger';
import { getWindowOrigin } from 'src/utils/url';
// import Chapter from 'types/Chapter';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ChapterListProps = {
  filteredChapters: Chapter[];
  selectedReciter: Reciter;
};

const ChapterList = ({ filteredChapters, selectedReciter }: ChapterListProps) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [downloadingChapterAudio, setDownloadingChapterAudio] = useState(null);

  const onPlayChapter = (chapterId?: string) => {
    const selectedChapterId = chapterId || getRandomChapterId().toString();

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

  return (
    <div className={styles.chapterListContainer}>
      {filteredChapters.map((chapter) => (
        <div
          key={chapter.id}
          className={styles.chapterListItem}
          onClick={() => {
            onPlayChapter(chapter.id.toString());
          }}
        >
          <div className={styles.chapterInfoContainer}>
            <div className={styles.chapterId}>{chapter.id}</div>
            <div>
              <div className={styles.chapterName}>{chapter.transliteratedName}</div>
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
                const origin = getWindowOrigin();
                clipboardCopy(`${origin}/${chapter.id}`).then(() => {
                  toast(t('common:shared'), { status: ToastStatus.Success });
                });
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
                const audioData = await getChapterAudioData(
                  Number(selectedReciter.id),
                  Number(chapter.id),
                );

                setDownloadingChapterAudio(chapter.id);
                download(audioData.audioUrl, () => {
                  setDownloadingChapterAudio(null);
                });
              }}
            >
              {downloadingChapterAudio === chapter.id ? (
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

export default ChapterList;
