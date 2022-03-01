/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import useSWR from 'swr/immutable';

import LanguageAndTafsirSelection from './LanguageAndTafsirSelection';
import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirEndOfScrollingActions from './TafsirEndOfScrollingActions';
import TafsirGroupMessage from './TafsirGroupMessage';
import TafsirSkeleton from './TafsirSkeleton';
import TafsirText from './TafsirText';
import TafsirVerseText from './TafsirVerseText';
import styles from './TafsirView.module.scss';

import { fetcher } from 'src/api';
import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import {
  selectIsUsingDefaultFont,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeTafsirContentUrl, makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import {
  logButtonClick,
  logEvent,
  logItemSelectionChange,
  logValueChange,
} from 'src/utils/eventLogger';
import { getLanguageDataById } from 'src/utils/locale';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from 'src/utils/navigation';
import { getSelectedTafsirLanguage, getTafsirsLanguageOptions } from 'src/utils/tafsir';
import {
  getVerseNumberFromKey,
  getFirstAndLastVerseKeys,
  makeVerseKey,
  isLastVerseOfSurah,
  getVerseAndChapterNumbersFromKey,
} from 'src/utils/verse';
import { TafsirContentResponse, TafsirsResponse } from 'types/ApiResponses';

type TafsirBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  initialTafsirData?: TafsirContentResponse;
  initialTafsirIdOrSlug?: number | string;
  scrollToTop: () => void;
  render: (renderProps: {
    surahAndAyahSelection: JSX.Element;
    languageAndTafsirSelection: JSX.Element;
    body: JSX.Element;
  }) => JSX.Element;
};

const TafsirBody = ({
  initialChapterId,
  initialVerseNumber,
  initialTafsirData,
  initialTafsirIdOrSlug,
  render,
  scrollToTop,
}: TafsirBodyProps) => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { lang } = useTranslation();
  const userPreferredTafsirIds = useSelector(selectSelectedTafsirs, areArraysEqual);
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const selectedVerseKey = makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber));
  const [selectedTafsirIdOrSlug, setSelectedTafsirIdOrSlug] = useState<number | string>(
    initialTafsirIdOrSlug || userPreferredTafsirIds?.[0],
  );

  // if user opened tafsirBody via a url, we will have initialTafsirIdOrSlug
  // we need to set this `initialTafsirIdOrSlug` as a selectedTafsirIdOrSlug
  // we did not use `useState(initialTafsirIdOrSlug)` because `useRouter`'s query string is undefined on first render
  useEffect(() => {
    if (initialTafsirIdOrSlug) {
      logEvent('tafsir_url_access');
      setSelectedTafsirIdOrSlug(initialTafsirIdOrSlug);
    }
  }, [initialTafsirIdOrSlug]);

  const onTafsirSelected = useCallback(
    (id: number, slug: string) => {
      logItemSelectionChange('tafsir', id);
      setSelectedTafsirIdOrSlug(slug);
      fakeNavigate(
        getVerseSelectedTafsirNavigationUrl(
          Number(selectedChapterId),
          Number(selectedVerseNumber),
          slug,
        ),
        lang,
      );
      dispatch(
        setSelectedTafsirs({
          tafsirs: [slug],
          locale: lang,
        }),
      );
    },
    [dispatch, lang, selectedChapterId, selectedVerseNumber],
  );

  const { data: tafsirSelectionList } = useSWR<TafsirsResponse>(makeTafsirsUrl(lang), fetcher);

  // selectedLanguage is based on selectedTafir's language
  // but we need to fetch the data from the API first to know what is the lanaguage of `selectedTafsirIdOrSlug`
  // so we get the data from the API and set the selectedLanguage once it is loaded
  useEffect(() => {
    if (tafsirSelectionList) {
      const languageName = getSelectedTafsirLanguage(tafsirSelectionList, selectedTafsirIdOrSlug);
      setSelectedLanguage(languageName);
    }
  }, [onTafsirSelected, selectedTafsirIdOrSlug, tafsirSelectionList]);

  // there's no 1:1 data that can map our locale options to the tafsir language options
  // so we're using options that's available from tafsir for now
  // TODO: update language options, to use the same options as our LanguageSelector
  const languageOptions = tafsirSelectionList
    ? getTafsirsLanguageOptions(tafsirSelectionList.tafsirs)
    : [];

  const renderTafsir = useCallback(
    (data: TafsirContentResponse) => {
      if (!data || !data.tafsir) return <TafsirSkeleton />;

      const { verses, text, languageId } = data.tafsir;
      const langData = getLanguageDataById(languageId);

      if (!text) return <TafsirSkeleton />;

      const [firstVerseKey, lastVerseKey] = getFirstAndLastVerseKeys(verses);
      const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(lastVerseKey);
      const hasNextVerseGroup = !isLastVerseOfSurah(chapterNumber, Number(verseNumber));
      const hasPrevVerseGroup = getVerseNumberFromKey(firstVerseKey) !== 1;

      const loadNextVerseGroup = () => {
        logButtonClick('tafsir_next_verse');
        scrollToTop();
        const newVerseNumber = String(Number(getVerseNumberFromKey(lastVerseKey)) + 1);
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(
            Number(selectedChapterId),
            Number(newVerseNumber),
            selectedTafsirIdOrSlug,
          ),
          lang,
        );
        setSelectedVerseNumber(newVerseNumber);
      };

      const loadPrevVerseGroup = () => {
        const newVerseNumber = String(Number(getVerseNumberFromKey(firstVerseKey)) - 1);
        logButtonClick('tafsir_prev_verse');
        scrollToTop();
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(
            Number(selectedChapterId),
            Number(newVerseNumber),
            selectedTafsirIdOrSlug,
          ),
          lang,
        );
        setSelectedVerseNumber(newVerseNumber);
      };

      return (
        <div>
          {Object.values(verses).length > 1 && (
            <TafsirGroupMessage from={firstVerseKey} to={lastVerseKey} />
          )}
          <div className={styles.verseTextContainer}>
            <TafsirVerseText verses={verses} />
          </div>
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
          <TafsirText direction={langData.direction} languageCode={langData.code} text={text} />
          <TafsirEndOfScrollingActions
            hasNextVerseGroup={hasNextVerseGroup}
            hasPrevVerseGroup={hasPrevVerseGroup}
            onNextButtonClicked={loadNextVerseGroup}
            onPreviousButtonClicked={loadPrevVerseGroup}
          />
        </div>
      );
    },
    [lang, scrollToTop, selectedChapterId, selectedTafsirIdOrSlug],
  );

  // Whether we should use the initial tafsir data or fetch the data on the client side
  const shouldUseInitialTafsirData = useMemo(
    () =>
      initialTafsirData &&
      isUsingDefaultFont &&
      Object.keys(initialTafsirData.tafsir.verses).includes(
        makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
      ) &&
      (selectedTafsirIdOrSlug === initialTafsirData?.tafsir?.slug ||
        Number(selectedTafsirIdOrSlug) === initialTafsirData?.tafsir?.resourceId),
    [
      initialTafsirData,
      isUsingDefaultFont,
      selectedChapterId,
      selectedTafsirIdOrSlug,
      selectedVerseNumber,
    ],
  );

  const surahAndAyahSelection = (
    <SurahAndAyahSelection
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      onChapterIdChange={(newChapterId) => {
        logItemSelectionChange('tafsir_chapter_id', newChapterId);
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(
            Number(newChapterId),
            Number(1),
            selectedTafsirIdOrSlug,
          ),
          lang,
        );
        setSelectedChapterId(newChapterId.toString());
        setSelectedVerseNumber('1'); // reset verse number to 1 every time chapter changes
      }}
      onVerseNumberChange={(newVerseNumber) => {
        logItemSelectionChange('tafsir_verse_number', newVerseNumber);
        setSelectedVerseNumber(newVerseNumber);
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(
            Number(selectedChapterId),
            Number(newVerseNumber),
            selectedTafsirIdOrSlug,
          ),
          lang,
        );
      }}
    />
  );

  const languageAndTafsirSelection = (
    <LanguageAndTafsirSelection
      selectedTafsirIdOrSlug={selectedTafsirIdOrSlug}
      selectedLanguage={selectedLanguage}
      onTafsirSelected={onTafsirSelected}
      onSelectLanguage={(newLang) => {
        logValueChange('tafsir_locale', selectedLanguage, newLang);
        setSelectedLanguage(newLang);
      }}
      languageOptions={languageOptions}
      data={tafsirSelectionList}
    />
  );

  const body = (
    <div
      className={classNames(
        styles.tafsirContainer,
        styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
      )}
    >
      {shouldUseInitialTafsirData ? (
        renderTafsir(initialTafsirData)
      ) : (
        <DataFetcher
          loading={TafsirSkeleton}
          queryKey={makeTafsirContentUrl(selectedTafsirIdOrSlug, selectedVerseKey, {
            words: true,
            ...getDefaultWordFields(quranReaderStyles.quranFont),
            ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
          })}
          render={renderTafsir}
        />
      )}
    </div>
  );

  return render({ surahAndAyahSelection, languageAndTafsirSelection, body });
};

export default TafsirBody;
