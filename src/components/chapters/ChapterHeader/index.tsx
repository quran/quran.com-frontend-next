/* eslint-disable i18next/no-literal-string */
import React, { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import { QURAN_READER_OBSERVER_ID } from '@/components/QuranReader/observer';
import PlayChapterAudioButton from '@/components/QuranReader/PlayChapterAudioButton';
import Bismillah from '@/dls/Bismillah/Bismillah';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useIntersectionObserver from '@/hooks/useObserveElement';
import InfoIcon from '@/icons/info.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahInfoNavigationUrl } from '@/utils/navigation';

interface Props {
  chapterId: string;
  pageNumber: number;
  hizbNumber: number;
  translationName?: string;
  isTranslationSelected?: boolean;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

const ChapterHeader: React.FC<Props> = ({
  chapterId,
  pageNumber,
  hizbNumber,
  translationName,
  isTranslationSelected,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const headerRef = useRef(null);
  /**
   * the intersection observer is needed so that we know that the first verse
   * of the current chapter is being read when the ChapterHeader appears within
   * the intersection observer root's borders.
   */
  useIntersectionObserver(headerRef, QURAN_READER_OBSERVER_ID);

  const onChangeTranslationClicked = () => {
    dispatch(setIsSettingsDrawerOpen(true));
    dispatch(setSettingsView(SettingsView.Translation));
    logButtonClick('change_translation');
  };

  return (
    <div
      ref={headerRef}
      data-verse-key={`${chapterId}:1`}
      data-page={pageNumber}
      data-chapter-id={chapterId}
      data-hizb={hizbNumber}
    >
      <div className={styles.header}>
        <div className={styles.chapterIconContainer}>
          <ChapterIconContainer chapterId={chapterId} size={ChapterIconsSize.Mega} />
        </div>
      </div>
      <div className={styles.bismillahContainer}>
        {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && <Bismillah />}
      </div>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.infoContainer}>
            {translationName ? (
              <div className={styles.translation}>
                {isTranslationSelected && (
                  <div className={styles.translationBy}>{t('quran-reader:translation-by')}</div>
                )}
                <span>{translationName}</span>{' '}
                <span
                  onKeyPress={onChangeTranslationClicked}
                  tabIndex={0}
                  role="button"
                  onClick={onChangeTranslationClicked}
                  className={styles.changeTranslation}
                >
                  ({t('quran-reader:trans-change')})
                </span>
                <span className={styles.changeTranslation} />
              </div>
            ) : (
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Ghost}
                prefix={<InfoIcon />}
                href={getSurahInfoNavigationUrl(chapterId)}
                shouldPrefetch={false}
                hasSidePadding={false}
                onClick={() => {
                  logButtonClick('chapter_header_info');
                }}
                id="surah-info-button"
              >
                {t('quran-reader:surah-info')}
              </Button>
            )}
          </div>
        </div>
        <div className={styles.right}>
          {translationName && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              prefix={<InfoIcon />}
              href={getSurahInfoNavigationUrl(chapterId)}
              shouldPrefetch={false}
              hasSidePadding={false}
              onClick={() => {
                logButtonClick('chapter_header_info');
              }}
              id="surah-info-button"
            >
              {t('quran-reader:surah-info')}
            </Button>
          )}
          <div className={styles.actionContainer}>
            <PlayChapterAudioButton chapterId={Number(chapterId)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterHeader;
