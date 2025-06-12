/* eslint-disable i18next/no-literal-string */
import React, { useRef } from 'react';

import { useDispatch } from 'react-redux';

import styles from './ChapterHeader.module.scss';
import BismillahSection from './components/BismillahSection';
import ChapterIcon from './components/ChapterIcon';
import SurahInfoButton from './components/SurahInfoButton';
import TranslationInfo from './components/TranslationInfo';

import { QURAN_READER_OBSERVER_ID } from '@/components/QuranReader/observer';
import PlayChapterAudioButton from '@/components/QuranReader/PlayChapterAudioButton';
import useIntersectionObserver from '@/hooks/useObserveElement';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

interface ChapterHeaderProps {
  chapterId: string;
  pageNumber: number;
  hizbNumber: number;
  translationName?: string;
  isTranslationSelected?: boolean;
}

/**
 * ChapterHeader component displays chapter information and controls
 * @param {ChapterHeaderProps} props - Component props
 * @returns {JSX.Element} The ChapterHeader component
 */
const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  chapterId,
  pageNumber,
  hizbNumber,
  translationName,
  isTranslationSelected,
}) => {
  const dispatch = useDispatch();
  const headerRef = useRef<HTMLDivElement>(null);

  /**
   * The intersection observer is needed so that we know that the first verse
   * of the current chapter is being read when the ChapterHeader appears within
   * the intersection observer root's borders.
   */
  useIntersectionObserver(headerRef, QURAN_READER_OBSERVER_ID);

  const handleChangeTranslation = () => {
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
      <ChapterIcon chapterId={chapterId} />
      <BismillahSection chapterId={chapterId} />

      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.infoContainer}>
            {translationName ? (
              <TranslationInfo
                translationName={translationName}
                isTranslationSelected={isTranslationSelected}
                onChangeTranslationClicked={handleChangeTranslation}
              />
            ) : (
              <SurahInfoButton chapterId={chapterId} />
            )}
          </div>
        </div>

        <div className={styles.right}>
          {translationName && <SurahInfoButton chapterId={chapterId} />}
          <div className={styles.actionContainer}>
            <PlayChapterAudioButton chapterId={Number(chapterId)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterHeader;
