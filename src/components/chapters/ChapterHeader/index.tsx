import React, { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import InfoIcon from '../../../../public/icons/info.svg';

import styles from './ChapterHeader.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';
import Bismillah from 'src/components/dls/Bismillah/Bismillah';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { QURAN_READER_OBSERVER_ID } from 'src/components/QuranReader/observer';
import PlayChapterAudioButton from 'src/components/QuranReader/PlayChapterAudioButton';
import useIntersectionObserver from 'src/hooks/useObserveElement';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { shouldUseMinimalLayout, toLocalizedNumber } from 'src/utils/locale';
import { getSurahInfoNavigationUrl } from 'src/utils/navigation';

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
  const { t, lang } = useTranslation('common');
  const headerRef = useRef(null);
  const isMinimalLayout = shouldUseMinimalLayout(lang);
  /**
   * the intersection observer is needed so that we know that the first verse
   * of the current chapter is being read when the ChapterHeader appears within
   * the intersection observer root's borders.
   */
  useIntersectionObserver(headerRef, QURAN_READER_OBSERVER_ID);
  const chapterData = getChapterData(chapterId, lang);

  const { translatedName } = chapterData;
  const { transliteratedName } = chapterData;

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
      <div className={styles.container}>
        <div className={styles.left}>
          {!isMinimalLayout && <div className={styles.translatedName}>{translatedName}</div>}
          <div className={styles.transliteratedName}>
            {t('surah')} <br /> {transliteratedName}
          </div>
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
                prefetch={false}
                hasSidePadding={false}
                onClick={() => {
                  logButtonClick('chapter_header_info');
                }}
              >
                {t('quran-reader:surah-info')}
              </Button>
            )}
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.chapterId}>{toLocalizedNumber(Number(chapterId), lang, true)}</div>
          <div className={styles.arabicSurahNameContainer}>
            <ChapterIconContainer
              chapterId={chapterId}
              size={ChapterIconsSize.Large}
              hasSurahPrefix={false}
            />
          </div>
          {translationName && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Ghost}
              prefix={<InfoIcon />}
              href={getSurahInfoNavigationUrl(chapterId)}
              prefetch={false}
              hasSidePadding={false}
              onClick={() => {
                logButtonClick('chapter_header_info');
              }}
            >
              {t('quran-reader:surah-info')}
            </Button>
          )}
          <div className={styles.actionContainer}>
            <PlayChapterAudioButton chapterId={Number(chapterId)} />
          </div>
        </div>
      </div>
      <div className={styles.bismillahContainer}>
        {!CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId) && <Bismillah />}
      </div>
    </div>
  );
};

export default ChapterHeader;
