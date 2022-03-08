import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import SurahAndAyahSelection from '../TafsirView/SurahAndAyahSelection';
import TafsirSkeleton from '../TafsirView/TafsirSkeleton';
import TranslationText from '../TranslationView/TranslationText';

import styles from './ReflectionBody.module.scss';
import ReflectionDisclaimerMessage from './ReflectionDisclaimerMessage';
import ReflectionItem from './ReflectionItem';

import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import {
  selectIsUsingDefaultFont,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { logItemSelectionChange } from 'src/utils/eventLogger';
import { fakeNavigate, getVerseSelectedReflectionNavigationUrl } from 'src/utils/navigation';
import { makeVerseKey } from 'src/utils/verse';

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
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const { lang } = useTranslation();
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const selectedTranslation = useSelector(selectSelectedTranslations);
  const { translationFontScale, quranFont, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const surahAndAyahSelection = (
    <SurahAndAyahSelection
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      onChapterIdChange={(newChapterId) => {
        logItemSelectionChange('reflection_chapter_id', newChapterId);
        fakeNavigate(
          getVerseSelectedReflectionNavigationUrl(
            makeVerseKey(newChapterId, Number(selectedVerseNumber)),
          ),
          lang,
        );
        setSelectedChapterId(newChapterId.toString());
        setSelectedVerseNumber('1'); // reset verse number to 1 every time chapter changes
      }}
      onVerseNumberChange={(newVerseNumber) => {
        logItemSelectionChange('reflection_verse_number', newVerseNumber);
        fakeNavigate(
          getVerseSelectedReflectionNavigationUrl(
            makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
          ),
          lang,
        );
        setSelectedVerseNumber(newVerseNumber);
      }}
    />
  );

  const renderBody = useCallback(
    (data) => {
      return (
        <div className={styles.container}>
          <ReflectionDisclaimerMessage />
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
          {data?.reflections?.map((reflection) => (
            <ReflectionItem
              key={reflection.id}
              date={reflection.createdAt}
              authorName={reflection?.author?.name}
              reflectionText={reflection?.body}
              avatarUrl={reflection?.author?.profileImg}
            />
          ))}
        </div>
      );
    },
    [translationFontScale],
  );

  const shouldUseInitialData =
    initialData &&
    isUsingDefaultFont &&
    initialChapterId === selectedChapterId &&
    initialVerseNumber === selectedVerseNumber;

  const body = shouldUseInitialData ? (
    renderBody(initialData)
  ) : (
    <DataFetcher
      loading={TafsirSkeleton}
      queryKey={`/api/quran-reflect?chapterId=${selectedChapterId}&verseNumber=${selectedVerseNumber}&quranFont=${quranFont}&mushafLines=${mushafLines}&translation=${selectedTranslation?.[0]}`}
      render={(data: any) => {
        return renderBody(data);
      }}
    />
  );

  return render({ surahAndAyahSelection, body });
};

export default ReflectionBody;
