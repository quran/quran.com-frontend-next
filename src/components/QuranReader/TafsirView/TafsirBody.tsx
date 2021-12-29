/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import uniq from 'lodash/uniq';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import useSWR from 'swr/immutable';

import LanguageAndTafsirSelection from './LanguageAndTafsirSelection';
import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirGroupMessage from './TafsirGroupMessage';
import TafsirSkeleton from './TafsirSkeleton';
import styles from './TafsirView.module.scss';

import { fetcher } from 'src/api';
import DataFetcher from 'src/components/DataFetcher';
import Separator from 'src/components/dls/Separator/Separator';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs, setSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getDefaultWordFields } from 'src/utils/api';
import { makeTafsirContentUrl, makeTafsirsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { logEvent, logItemSelectionChange, logValueChange } from 'src/utils/eventLogger';
import { getLanguageDataById } from 'src/utils/locale';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from 'src/utils/navigation';
import { getFirstAndLastVerseKeys, getVerseWords, makeVerseKey } from 'src/utils/verse';
import { TafsirContentResponse, TafsirsResponse } from 'types/ApiResponses';
import Tafsir from 'types/Tafsir';

type TafsirBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  initialTafsirData?: TafsirContentResponse;
  initialTafsirId?: number;
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
  initialTafsirId,
  render,
}: TafsirBodyProps) => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { lang } = useTranslation();
  const userPreferredTafsirIds = useSelector(selectSelectedTafsirs, areArraysEqual);

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const selectedVerseKey = makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber));
  const [selectedTafsirId, setSelectedTafsirId] = useState(
    initialTafsirId || userPreferredTafsirIds?.[0],
  );

  // if user opened tafsirBody via a url, we will have initialTafsirId
  // we need to set this `initialTafsirId` as a selectedTafsirId
  // we did not use `useState(initialTafsirId)` because `useRouter`'s query string is undefined on first render
  useEffect(() => {
    if (initialTafsirId) {
      logEvent('tafsir_url_access');
      setSelectedTafsirId(initialTafsirId);
    }
  }, [initialTafsirId]);

  const onTafsirSelected = useCallback(
    (id: number) => {
      logItemSelectionChange('tafsir', id);
      setSelectedTafsirId(id);
      fakeNavigate(
        getVerseSelectedTafsirNavigationUrl(
          Number(selectedChapterId),
          Number(selectedVerseNumber),
          id,
        ),
      );
      dispatch(
        setSelectedTafsirs({
          tafsirs: [id],
          locale: lang,
        }),
      );
    },
    [dispatch, lang, selectedChapterId, selectedVerseNumber],
  );

  const { data: tafsirSelectionList } = useSWR<TafsirsResponse>(makeTafsirsUrl(lang), fetcher);

  // selectedLanguage is based on selectedTafir's language
  // but we need to fetch the data from the API first to know what is the lanaguage of `selectedTafsirId`
  // so we get the data from the API and set the selectedLanguage once it is loaded
  useEffect(() => {
    if (tafsirSelectionList) {
      const languageName = getSelectedTafsirLanguage(tafsirSelectionList, selectedTafsirId);
      setSelectedLanguage(languageName);
    }
  }, [onTafsirSelected, selectedTafsirId, tafsirSelectionList]);

  // there's no 1:1 data that can map our locale options to the tafsir language options
  // so we're using options that's available from tafsir for now
  // TODO: update language options, to use the same options as our LanguageSelector
  const languageOptions = tafsirSelectionList
    ? getTafsirsLanguageOptions(tafsirSelectionList.tafsirs)
    : [];

  const renderTafsir = useCallback((data) => {
    if (!data || !data.tafsir) return <TafsirSkeleton />;

    const { verses, text, languageId } = data.tafsir;
    const langData = getLanguageDataById(languageId);
    const words = Object.values(verses).map(getVerseWords).flat();

    if (!text) return <TafsirSkeleton />;

    const [firstVerseKey, lastVerseKey] = getFirstAndLastVerseKeys(verses);
    return (
      <div>
        {Object.values(verses).length > 1 && (
          <TafsirGroupMessage from={firstVerseKey} to={lastVerseKey} />
        )}
        <div className={styles.verseTextContainer}>
          <VerseText words={words} />
        </div>
        <div className={styles.separatorContainer}>
          <Separator />
        </div>
        <div
          dir={langData.direction}
          lang={langData.code}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    );
  }, []);

  const tafsirContentQueryKey = makeTafsirContentUrl(selectedTafsirId, selectedVerseKey, {
    words: true,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
  });

  // Whether we should use the initial tafsir data or fetch the data on the client side
  const shouldUseInitialTafsirData = useMemo(
    () =>
      initialTafsirData &&
      Object.keys(initialTafsirData.tafsir.verses).includes(
        makeVerseKey(Number(selectedChapterId), Number(selectedVerseNumber)),
      ) &&
      selectedTafsirId === initialTafsirData?.tafsir?.resourceId,
    [initialTafsirData, selectedChapterId, selectedTafsirId, selectedVerseNumber],
  );

  const surahAndAyahSelection = (
    <SurahAndAyahSelection
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      onChapterIdChange={(newChapterId) => {
        logItemSelectionChange('tafsir_chapter_id', newChapterId);
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(Number(newChapterId), Number(1), selectedTafsirId),
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
            selectedTafsirId,
          ),
        );
      }}
    />
  );

  const languageAndTafsirSelection = (
    <LanguageAndTafsirSelection
      selectedTafsirId={selectedTafsirId}
      selectedLanguage={selectedLanguage}
      onTafsirSelected={onTafsirSelected}
      onSelectLanguage={(newLang) => {
        logValueChange('tafsir_locale', selectedLanguage, newLang);
        setSelectedLanguage(newLang);
      }}
      languageOptions={languageOptions}
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
          queryKey={tafsirContentQueryKey}
          render={renderTafsir}
        />
      )}
    </div>
  );

  return render({ surahAndAyahSelection, languageAndTafsirSelection, body });
};

/**
 * Given list of tafsirs, get all available language options
 *
 * @param {Tafsir[]} tafsirs
 * @returns {string[]} list of available language options
 */
const getTafsirsLanguageOptions = (tafsirs: Tafsir[]): string[] =>
  uniq(tafsirs.map((tafsir) => tafsir.languageName));

/**
 * Get the language of the selected Tafsir.
 *
 * @param {TafsirsResponse} tafsirListData
 * @param {number} selectedTafsirId
 * @returns {string}
 */
const getSelectedTafsirLanguage = (
  tafsirListData: TafsirsResponse,
  selectedTafsirId: number,
): string => {
  const selectedTafsir = tafsirListData?.tafsirs.find((tafsir) => tafsir.id === selectedTafsirId);
  return selectedTafsir?.languageName;
};

export default TafsirBody;
