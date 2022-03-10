/* eslint-disable max-lines */
import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import SurahAndAyahSelection from '../TafsirView/SurahAndAyahSelection';
import TafsirEndOfScrollingActions from '../TafsirView/TafsirEndOfScrollingActions';
import TafsirSkeleton from '../TafsirView/TafsirSkeleton';
import TranslationText from '../TranslationView/TranslationText';

import styles from './ReflectionBody.module.scss';
import ReflectionDisclaimerMessage from './ReflectionDisclaimerMessage';
import ReflectionItem from './ReflectionItem';

import DataFetcher from 'src/components/DataFetcher';
import Button from 'src/components/dls/Button/Button';
import Separator from 'src/components/dls/Separator/Separator';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import {
  selectIsUsingDefaultFont,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import {
  selectIsUsingDefaultTranslations,
  selectSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { makeVerseReflectionsUrl } from 'src/utils/apiPaths';
import { logButtonClick, logItemSelectionChange } from 'src/utils/eventLogger';
import {
  fakeNavigate,
  getQuranReflectVerseUrl,
  getVerseSelectedReflectionNavigationUrl,
} from 'src/utils/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from 'src/utils/verse';

type ReflectionBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  scrollToTop: () => void;
  render: (renderProps: { surahAndAyahSelection: JSX.Element; body: JSX.Element }) => JSX.Element;
  initialData?: any;
};

const ReflectionBody = ({
  render,
  initialChapterId,
  initialVerseNumber,
  initialData,
  scrollToTop,
}: ReflectionBodyProps) => {
  const { t } = useTranslation('quran-reader');
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const { lang } = useTranslation();
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const selectedTranslation = useSelector(selectSelectedTranslations);
  const { translationFontScale, quranFont, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const surahAndAyahSelection = (
    <div className={styles.surahSelectionContainer}>
      <SurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        onChapterIdChange={(newChapterId) => {
          logItemSelectionChange('reflection_chapter_id', newChapterId);
          setSelectedChapterId(newChapterId.toString());
          const newVerseNumber = '1';
          setSelectedVerseNumber(newVerseNumber); // reset verse number to 1 every time chapter changes
          fakeNavigate(
            getVerseSelectedReflectionNavigationUrl(
              makeVerseKey(newChapterId, Number(newVerseNumber)),
            ),
            lang,
          );
        }}
        onVerseNumberChange={(newVerseNumber) => {
          logItemSelectionChange('reflection_verse_number', newVerseNumber);
          setSelectedVerseNumber(newVerseNumber.toString());
          fakeNavigate(
            getVerseSelectedReflectionNavigationUrl(
              makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
            ),
            lang,
          );
        }}
      />
    </div>
  );

  const loadNextVerse = useCallback(() => {
    logButtonClick('reflection_next_verse');
    scrollToTop();
    const newVerseNumber = String(Number(selectedVerseNumber) + 1);
    fakeNavigate(
      getVerseSelectedReflectionNavigationUrl(
        makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
      ),
      lang,
    );
    setSelectedVerseNumber(newVerseNumber);
  }, [lang, scrollToTop, selectedChapterId, selectedVerseNumber]);

  const loadPrevVerse = useCallback(() => {
    const newVerseNumber = String(Number(selectedVerseNumber) - 1);
    logButtonClick('reflection_prev_verse');
    scrollToTop();
    setSelectedVerseNumber(newVerseNumber);
    fakeNavigate(
      getVerseSelectedReflectionNavigationUrl(
        makeVerseKey(Number(selectedChapterId), Number(newVerseNumber)),
      ),
      lang,
    );
  }, [lang, scrollToTop, selectedChapterId, selectedVerseNumber]);

  const renderBody = useCallback(
    (data) => {
      const hasNextVerse = !isLastVerseOfSurah(selectedChapterId, Number(selectedVerseNumber));
      const hasPrevVerse = !isFirstVerseOfSurah(Number(selectedVerseNumber));

      return (
        <div className={styles.container}>
          {data?.verse && (
            <div className={styles.verseContainer}>
              <PlainVerseText words={data.verse?.words} />
            </div>
          )}
          {data?.verse?.translations?.length > 0 && (
            <div className={styles.translationContainer}>
              <TranslationText
                languageId={data.verse.translations?.[0].languageId}
                resourceName={data.verse.translations?.[0].resourceName}
                translationFontScale={translationFontScale}
                text={data.verse.translations?.[0].text}
              />
            </div>
          )}
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
          <ReflectionDisclaimerMessage />
          {data?.reflections?.map((reflection) => (
            <ReflectionItem
              id={reflection.id}
              key={reflection.id}
              date={reflection.createdAt}
              authorName={reflection?.author?.name}
              isAuthorVerified={reflection?.author?.verified}
              reflectionText={reflection?.body}
              avatarUrl={reflection?.author?.profileImg}
            />
          ))}
          <div className={styles.readMoreButtonContainer}>
            <Button
              href={getQuranReflectVerseUrl(
                makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
              )}
              newTab
            >
              {t('read-more-quran-reflect')}
            </Button>
          </div>

          <div className={styles.endOfScrollActionsContainer}>
            <TafsirEndOfScrollingActions
              hasNextVerseGroup={hasNextVerse}
              hasPrevVerseGroup={hasPrevVerse}
              onNextButtonClicked={loadNextVerse}
              onPreviousButtonClicked={loadPrevVerse}
            />
          </div>
        </div>
      );
    },
    [loadNextVerse, loadPrevVerse, selectedChapterId, selectedVerseNumber, t, translationFontScale],
  );

  const shouldUseInitialData =
    initialData &&
    isUsingDefaultFont &&
    isUsingDefaultTranslations &&
    initialChapterId === selectedChapterId &&
    initialVerseNumber === selectedVerseNumber;

  const body = shouldUseInitialData ? (
    renderBody(initialData)
  ) : (
    <DataFetcher
      loading={TafsirSkeleton}
      queryKey={makeVerseReflectionsUrl(
        selectedChapterId,
        selectedVerseNumber,
        quranFont,
        mushafLines,
        selectedTranslation?.[0],
      )}
      render={renderBody}
    />
  );

  return render({ surahAndAyahSelection, body });
};

export default ReflectionBody;
