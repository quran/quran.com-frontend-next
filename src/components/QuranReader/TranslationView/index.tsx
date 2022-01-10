/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable react/no-multi-comp */
import React, { useRef, useState, useEffect } from 'react';

import range from 'lodash/range';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './TranslationView.module.scss';
import TranslationViewCell from './TranslationViewCell';
import TranslationViewCellSkeleton from './TranslatioViewCellSkeleton';

import { fetcher } from 'src/api';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Spinner from 'src/components/dls/Spinner/Spinner';
import useQcfFont from 'src/hooks/useQcfFont';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesFilterUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getChapterData } from 'src/utils/chapter';
import { VersesResponse } from 'types/ApiResponses';
import { QuranFont, QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
  initialData: VersesResponse;
};

const EndOfScrollingControls = dynamic(() => import('../EndOfScrollingControls'), {
  ssr: false,
  loading: () => <Spinner />,
});

const getInitialLoadedItems = (
  dataType: QuranReaderDataType,
  initialVerses: Verse[],
): Record<number, boolean> => {
  const loadedItems = {};
  if (
    dataType === QuranReaderDataType.Chapter ||
    dataType === QuranReaderDataType.Verse ||
    dataType === QuranReaderDataType.VerseRange
  ) {
    initialVerses.forEach((verse) => {
      loadedItems[verse.verseNumber] = true;
    });
  }
  // TODO: Add the other types e.g. juz/page
  return loadedItems;
};

const controller = new AbortController();
const { signal } = controller;

const getTotalCount = (
  firstVerse: Verse,
  quranReaderDataType: QuranReaderDataType,
  initialData: VersesResponse,
): number => {
  const { chapterId } = firstVerse;
  if (quranReaderDataType === QuranReaderDataType.Verse) {
    return 1;
  }
  if (quranReaderDataType === QuranReaderDataType.VerseRange) {
    return Number(initialData.metaData.to) - Number(initialData.metaData.from) + 1;
  }

  // TODO: add page/juz
  const chapterData = getChapterData(String(chapterId));
  return chapterData.versesCount;
};

const TranslationView = ({
  quranReaderStyles,
  quranReaderDataType,
  initialData,
  verses: initialVerses,
}: TranslationViewProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  useQcfFont(quranReaderStyles.quranFont, verses);
  const [firstVerse] = verses;
  const { verseNumber: firstVerseNumber, chapterId } = firstVerse;
  const showChapterHeader = firstVerseNumber === 1;
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const loadedItemsMap = useRef<Record<number, boolean>>(
    getInitialLoadedItems(quranReaderDataType, initialVerses),
  );

  useEffect(() => {
    // abort any fetch requests before un-mounting
    return () => {
      controller.abort();
    };
  }, []);

  const loadingItemsMap = useRef<Record<number, boolean>>({});
  return (
    <div className={styles.container}>
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        totalCount={getTotalCount(firstVerse, quranReaderDataType, initialData)}
        overscan={30}
        rangeChanged={(renderedRange) => {
          const toLoadVerses: number[] = [];
          // generate all the verse keys between the start and the end
          range(renderedRange.startIndex + 1, renderedRange.endIndex + 2).forEach((verseNumber) => {
            let number = verseNumber;
            if (quranReaderDataType === QuranReaderDataType.VerseRange) {
              number = Number(initialData.metaData.from) + verseNumber;
            }
            // if the verse has not been loaded or is loading
            if (!loadedItemsMap.current[number] && !loadingItemsMap.current[number]) {
              toLoadVerses.push(number);
              // add the verse to loading to lock it from being request again
              loadingItemsMap.current = {
                ...loadingItemsMap.current,
                [number]: true,
              };
            }
          });
          // if there is at least a verse that hasn't been loaded yet
          if (toLoadVerses.length) {
            // TODO: add missing params and move this to api.ts
            fetcher(
              makeVersesFilterUrl({
                filters: toLoadVerses.map((verseNumber) => `${chapterId}:${verseNumber}`).join(','),
                fields: `${QuranFont.Uthmani},chapter_id,hizb_number,text_imlaei_simple`,
                words: true,
                wordFields: `verse_key, verse_id, page_number, location, text_uthmani, ${
                  quranReaderStyles.quranFont
                }${
                  quranReaderStyles.quranFont === QuranFont.QPCHafs ? '' : `, ${QuranFont.QPCHafs}`
                }`,
                ...getDefaultWordFields(quranReaderStyles.quranFont),
                ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
                reciter: 7, // TODO: make this dynamic
                // when there is a translation in Redux
                ...(!!selectedTranslations.length && {
                  translations: selectedTranslations.join(','),
                  translationFields: 'text,resource_id,resource_name',
                }),
              }),
              { signal },
            )
              .then((response: VersesResponse) => {
                setVerses((prevVerses) => [...prevVerses, ...response.verses]);
                // add the verses in the response to the loaded items map
                toLoadVerses.forEach((verseNumber) => {
                  loadedItemsMap.current = { ...loadedItemsMap.current, [verseNumber]: true };
                });
                // remove from currently loading items
                const newLoadingItemsMap = { ...loadingItemsMap.current };
                toLoadVerses.forEach((verseNumber) => {
                  delete newLoadingItemsMap[verseNumber];
                });
                loadingItemsMap.current = newLoadingItemsMap;
              })
              .catch(() => {
                // remove from currently loading items
                const newLoadingItemsMap = { ...loadingItemsMap.current };
                toLoadVerses.forEach((verseNumber) => {
                  delete newLoadingItemsMap[verseNumber];
                });
                loadingItemsMap.current = newLoadingItemsMap;
              });
          }
        }}
        initialItemCount={initialVerses.length} // needed for SSR.
        itemContent={(currentVerseIndex) => {
          return verses[currentVerseIndex] ? (
            <TranslationViewCell
              verseIndex={currentVerseIndex}
              verse={verses[currentVerseIndex]}
              key={verses[currentVerseIndex].id}
              quranReaderStyles={quranReaderStyles}
            />
          ) : (
            <TranslationViewCellSkeleton />
          );
        }}
        components={{
          Footer: () => (
            // TODO: check if we need different ones for verse/range
            <EndOfScrollingControls
              quranReaderDataType={quranReaderDataType}
              lastVerse={verses[verses.length - 1]} // TODO: this needs to be sorted first.
            />
          ),
          ...(showChapterHeader && {
            Header: () => (
              <ChapterHeader
                chapterId={String(firstVerse.chapterId)}
                pageNumber={firstVerse.pageNumber}
                hizbNumber={firstVerse.hizbNumber}
              />
            ),
          }),
        }}
      />
    </div>
  );
};

export default TranslationView;
