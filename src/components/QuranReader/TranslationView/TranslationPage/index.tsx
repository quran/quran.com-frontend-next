import React, { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import { getRequestKey, verseFetcher } from 'src/components/QuranReader/api';
import TranslationViewCell from 'src/components/QuranReader/TranslationView/TranslationViewCell';
import TranslationViewSkeleton from 'src/components/QuranReader/TranslationView/TranslationViewSkeleton';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { selectIsUsingDefaultReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectIsUsingDefaultWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  pageNumber: number;
  quranReaderDataType: QuranReaderDataType;
  quranReaderStyles: QuranReaderStyles;
  setApiPageToVersesMap: (data: Record<number, Verse[]>) => void;
  selectedTranslations: number[];
  wordByWordLocale: string;
  reciterId: number;
  initialData: VersesResponse;
  resourceId: number | string;
  versesPerPage: number;
}

const TranslationPage: React.FC<Props> = ({
  pageNumber,
  quranReaderDataType,
  quranReaderStyles,
  selectedTranslations,
  wordByWordLocale,
  reciterId,
  initialData,
  resourceId,
  setApiPageToVersesMap,
  versesPerPage,
}) => {
  const { lang } = useTranslation();
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const shouldUseInitialData =
    pageNumber === 1 &&
    quranReaderStyles.quranFont === getQuranReaderStylesInitialState(lang).quranFont &&
    isUsingDefaultReciter &&
    isUsingDefaultWordByWordLocale &&
    quranReaderDataType !== QuranReaderDataType.Juz;
  const { data: verses } = useSWRImmutable(
    getRequestKey({
      quranReaderDataType,
      pageNumber,
      initialData,
      quranReaderStyles,
      selectedTranslations,
      isVerseData: quranReaderDataType === QuranReaderDataType.Verse,
      id: resourceId,
      reciter: reciterId,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
    {
      fallbackData: shouldUseInitialData ? initialData.verses : null,
      revalidateOnMount: !shouldUseInitialData,
    },
  );

  useEffect(() => {
    if (verses) {
      // @ts-ignore
      setApiPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: verses,
      }));
    }
  }, [pageNumber, setApiPageToVersesMap, verses]);

  if (!verses) {
    return <TranslationViewSkeleton numberOfSkeletons={versesPerPage} />;
  }
  return (
    <>
      {verses.map((verse, index) => {
        const currentVerseIndex =
          pageNumber === 1 ? index : index + (pageNumber - 1) * versesPerPage;
        return (
          <div key={currentVerseIndex}>
            {verse.verseNumber === 1 && (
              <ChapterHeader
                chapterId={String(verse.chapterId)}
                pageNumber={verse.pageNumber}
                hizbNumber={verse.hizbNumber}
              />
            )}
            <TranslationViewCell
              verseIndex={currentVerseIndex}
              verse={verse}
              key={verse.id}
              quranReaderStyles={quranReaderStyles}
            />
          </div>
        );
      })}
    </>
  );
};

export default TranslationPage;
