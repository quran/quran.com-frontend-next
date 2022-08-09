import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import CopyLinkIcon from '../../../public/icons/copy-link.svg';
import DownloadIcon from '../../../public/icons/download.svg';
import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { download } from '../AudioPlayer/Buttons/DownloadAudioButton';
import { triggerPauseAudio } from '../AudioPlayer/EventTriggers';
import ChapterIconContainer from '../chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import Spinner, { SpinnerSize } from '../dls/Spinner/Spinner';
import { ToastStatus, useToast } from '../dls/Toast/Toast';

import styles from './ChapterList.module.scss';

import { getChapterAudioData } from 'src/api';
import { logButtonClick, logEvent } from 'src/utils/eventLogger';
import { getReciterChapterNavigationUrl } from 'src/utils/navigation';
import { getWindowOrigin } from 'src/utils/url';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ChaptersListProps = {
  filteredChapters: Chapter[];
  selectedReciter: Reciter;
};

const ChaptersList = ({ filteredChapters, selectedReciter }: ChaptersListProps) => {
  const toast = useToast();
  const { t, lang } = useTranslation();
  const audioService = useContext(AudioPlayerMachineContext);
  const currentSurah = useSelector(audioService, (state) => state.context.surah);
  // const [state, send] = useActor(audioService);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );

  const [currentlyDownloadChapterAudioId, setCurrentlyDownloadChapterAudioId] = useState(null);

  const playChapter = (chapterId: string) => {
    const selectedChapterId = chapterId;

    logEvent('reciter_page_chapter_played', {
      stationId: selectedChapterId,
    });

    // TODO: Update xstate to be able to play the surah without changing the reciter in the context
    audioService.send({ type: 'CHANGE_RECITER', reciterId: selectedReciter.id });
    audioService.send({ type: 'PLAY_SURAH', surah: Number(chapterId) });
  };

  const onCopyUrlClicked = (chapterId) => {
    logButtonClick('reciter_page_chapter_url_copy');
    const origin = getWindowOrigin(lang);
    const path = getReciterChapterNavigationUrl(selectedReciter.id.toString(), chapterId);
    clipboardCopy(origin + path).then(() => {
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
      {filteredChapters.map((chapter) => {
        const isAudioPlayingThisChapter = isAudioPlaying && currentSurah === Number(chapter.id);

        const onClick = () => {
          if (isAudioPlayingThisChapter) triggerPauseAudio();
          else playChapter(chapter.id.toString());
        };

        return (
          <div
            key={chapter.id}
            className={styles.chapterListItem}
            role="button"
            tabIndex={0}
            onKeyPress={onClick}
            onClick={onClick}
          >
            <div className={styles.chapterInfoContainer}>
              <div className={styles.playIconWrapper}>
                {isAudioPlayingThisChapter ? (
                  <span className={classNames(styles.playPauseIcon)}>
                    <PauseIcon />
                  </span>
                ) : (
                  <span className={classNames(styles.playPauseIcon, styles.playIcon)}>
                    <PlayIcon />
                  </span>
                )}
              </div>
              <div>
                <div className={styles.chapterName}>
                  {chapter.localizedId}. {chapter.transliteratedName}
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
                tooltip={t('reciter:copy-link')}
                ariaLabel={t('reciter:copy-link')}
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
                tooltip={t('common:audio.player.download')}
                ariaLabel={t('common:audio.player.download')}
              >
                {currentlyDownloadChapterAudioId === chapter.id ? (
                  <Spinner size={SpinnerSize.Small} />
                ) : (
                  <DownloadIcon />
                )}
              </Button>
            </div>
          </div>
        );
      })}
      <div />
    </div>
  );
};

export default ChaptersList;
