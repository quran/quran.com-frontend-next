/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React, { useCallback, useContext, useEffect, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr/immutable';

import VerseTextPreview from '../VerseTextPreview';

import LanguageAndTafsirSelection from './LanguageAndTafsirSelection';
import SurahAndAyahSelection from './SurahAndAyahSelection';
import TafsirEndOfScrollingActions from './TafsirEndOfScrollingActions';
import TafsirGroupMessage from './TafsirGroupMessage';
import TafsirMessage from './TafsirMessage';
import TafsirSkeleton from './TafsirSkeleton';
import TafsirText from './TafsirText';
import styles from './TafsirView.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Separator from '@/dls/Separator/Separator';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectTafsirs, setSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import {
  logButtonClick,
  logEvent,
  logItemSelectionChange,
  logValueChange,
} from '@/utils/eventLogger';
import { getLanguageDataById } from '@/utils/locale';
import { fakeNavigate, getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';
import {
  getFirstTafsirOfLanguage,
  getSelectedTafsirLanguage,
  getTafsirsLanguageOptions,
} from '@/utils/tafsir';
import {
  getVerseNumberFromKey,
  getFirstAndLastVerseKeys,
  makeVerseKey,
  isLastVerseOfSurah,
  getVerseAndChapterNumbersFromKey,
} from '@/utils/verse';
import { fetcher } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import { TafsirContentResponse, TafsirsResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';

type TafsirBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  initialTafsirIdOrSlug?: number | string;
  scrollToTop: () => void;
  shouldRender?: boolean;
  render: (renderProps: {
    surahAndAyahSelection: JSX.Element;
    languageAndTafsirSelection: JSX.Element;
    body: JSX.Element;
  }) => JSX.Element;
};

const TafsirBody = ({
  initialChapterId,
  initialVerseNumber,
  initialTafsirIdOrSlug,
  render,
  scrollToTop,
  shouldRender,
}: TafsirBodyProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { lang, t } = useTranslation('common');
  const tafsirsState = useSelector(selectTafsirs);
  const { selectedTafsirs: userPreferredTafsirIds } = tafsirsState;
  const chaptersData = useContext(DataContext);
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

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
      onSettingsChange(
        'selectedTafsirs',
        [slug],
        setSelectedTafsirs({
          tafsirs: [slug],
          locale: lang,
        }),
        setSelectedTafsirs({
          tafsirs: tafsirsState.selectedTafsirs,
          locale: lang,
        }),
        PreferenceGroup.TAFSIRS,
      );
    },
    [lang, onSettingsChange, selectedChapterId, selectedVerseNumber, tafsirsState],
  );

  const { data: tafsirSelectionList } = useSWR<TafsirsResponse>(
    shouldRender ? makeTafsirsUrl(lang) : null,
    fetcher,
  );

  // selectedLanguage is based on selectedTafsir's language
  // but we need to fetch the data from the API first to know what is the language of `selectedTafsirIdOrSlug`
  // so we get the data from the API and set the selectedLanguage once it is loaded
  useEffect(() => {
    if (tafsirSelectionList) {
      setSelectedLanguage((prevSelectedLanguage) => {
        // if we haven't set the language already, we need to detect which language the current tafsir is in.
        return (
          prevSelectedLanguage ||
          getSelectedTafsirLanguage(tafsirSelectionList, selectedTafsirIdOrSlug)
        );
      });
    }
  }, [onTafsirSelected, selectedTafsirIdOrSlug, tafsirSelectionList]);

  // there's no 1:1 data that can map our locale options to the tafsir language options
  // so we're using options that's available from tafsir for now
  // TODO: update language options, to use the same options as our LanguageSelector
  const languageOptions = tafsirSelectionList
    ? getTafsirsLanguageOptions(tafsirSelectionList.tafsirs)
    : [];

  /**
   * Handle when the language of the Tafsir is changed. When it does,
   * we auto-select the first Tafsir of the new language based on the
   * response from BE.
   *
   * @param {string} newLang
   */
  const onLanguageSelected = (newLang: string) => {
    logValueChange('tafsir_locale', selectedLanguage, newLang);
    setSelectedLanguage(newLang);

    if (tafsirSelectionList) {
      const firstTafsirOfLanguage = getFirstTafsirOfLanguage(tafsirSelectionList, newLang);
      if (firstTafsirOfLanguage) {
        const { id, slug } = firstTafsirOfLanguage;
        onTafsirSelected(id, slug);
      }
    }
  };

  const renderTafsir = useCallback(
    (data: TafsirContentResponse) => {
      if (!data || !data.tafsir) return <TafsirSkeleton />;

      const { verses, text, languageId } = data.tafsir;
      const langData = getLanguageDataById(languageId);

      const [firstVerseKey, lastVerseKey] = getFirstAndLastVerseKeys(verses);
      const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(lastVerseKey);
      const hasNextVerseGroup = !isLastVerseOfSurah(
        chaptersData,
        chapterNumber,
        Number(verseNumber),
      );
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
          {!text && (
            <TafsirMessage>
              {t('tafsir.no-text', {
                tafsirName: data.tafsir.translatedName.name,
              })}
            </TafsirMessage>
          )}
          {Object.values(verses).length > 1 && !!text && (
            <TafsirGroupMessage from={firstVerseKey} to={lastVerseKey} />
          )}
          <div className={styles.verseTextContainer}>
            <VerseTextPreview verses={Object.values(verses)} />
          </div>
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
          {!!text && (
            <TafsirText direction={langData.direction} languageCode={langData.code} text={text} />
          )}
          <TafsirEndOfScrollingActions
            hasNextVerseGroup={hasNextVerseGroup}
            hasPrevVerseGroup={hasPrevVerseGroup}
            onNextButtonClicked={loadNextVerseGroup}
            onPreviousButtonClicked={loadPrevVerseGroup}
          />
        </div>
      );
    },
    [chaptersData, lang, scrollToTop, selectedChapterId, selectedTafsirIdOrSlug, t],
  );

  const onChapterIdChange = (newChapterId) => {
    logItemSelectionChange('tafsir_chapter_id', newChapterId);
    fakeNavigate(
      getVerseSelectedTafsirNavigationUrl(Number(newChapterId), Number(1), selectedTafsirIdOrSlug),
      lang,
    );
    setSelectedChapterId(newChapterId.toString());
    setSelectedVerseNumber('1'); // reset verse number to 1 every time chapter changes
  };

  const onVerseNumberChange = (newVerseNumber) => {
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
  };

  const surahAndAyahSelection = (
    <SurahAndAyahSelection
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      onChapterIdChange={onChapterIdChange}
      onVerseNumberChange={onVerseNumberChange}
    />
  );

  const languageAndTafsirSelection = (
    <LanguageAndTafsirSelection
      selectedTafsirIdOrSlug={selectedTafsirIdOrSlug}
      selectedLanguage={selectedLanguage}
      onTafsirSelected={onTafsirSelected}
      onSelectLanguage={onLanguageSelected}
      languageOptions={languageOptions}
      data={tafsirSelectionList}
      isLoading={isLoading}
    />
  );

  const body = (
    <div
      className={classNames(
        styles.tafsirContainer,
        styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
      )}
      // disable browser translation for tafsir content
      // @see {https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/translate}
      translate="no"
    >
      <DataFetcher
        loading={TafsirSkeleton}
        queryKey={makeTafsirContentUrl(selectedTafsirIdOrSlug, selectedVerseKey, {
          lang,
          quranFont: quranReaderStyles.quranFont,
          mushafLines: quranReaderStyles.mushafLines,
        })}
        render={renderTafsir}
      />
    </div>
  );

  return render({ surahAndAyahSelection, languageAndTafsirSelection, body });
};

export default TafsirBody;
