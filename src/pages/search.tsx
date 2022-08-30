/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import clipboardCopy from 'clipboard-copy';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import FilterIcon from '../../public/icons/filter.svg';
import SearchIcon from '../../public/icons/search.svg';

import styles from './search.module.scss';

import {
  getAvailableLanguages,
  getAvailableTranslations,
  getFilteredVerses,
  getKalimatSearchResults,
  submitKalimatSearchResultFeedback,
} from 'src/api';
import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import ContentModal, { ContentModalSize } from 'src/components/dls/ContentModal/ContentModal';
import Input, { InputVariant } from 'src/components/dls/Forms/Input';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import Modal from 'src/components/dls/Modal/Modal';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import Toggle from 'src/components/dls/Toggle/Toggle';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TranslationsFilter from 'src/components/Search/Filters/TranslationsFilter';
import SearchBodyContainer from 'src/components/Search/SearchBodyContainer';
import DataContext from 'src/contexts/DataContext';
import useAddQueryParamsToUrl from 'src/hooks/useAddQueryParamsToUrl';
import useDebounce from 'src/hooks/useDebounce';
import { getTranslationsInitialState } from 'src/redux/defaultSettings/util';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { getAllChaptersData } from 'src/utils/chapter';
import {
  logButtonClick,
  logEvent,
  logTextSearchQuery,
  logValueChange,
} from 'src/utils/eventLogger';
import filterTranslations from 'src/utils/filter-translations';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';
import { VersesResponse } from 'types/ApiResponses';
import AvailableLanguage from 'types/AvailableLanguage';
import AvailableTranslation from 'types/AvailableTranslation';
import ChaptersData from 'types/ChaptersData';
import { RuleType } from 'types/FieldRule';
import { FormFieldType } from 'types/FormField';
import { QuranFont } from 'types/QuranReader';

const PAGE_SIZE = 10;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  translations: AvailableTranslation[];
  chaptersData: ChaptersData;
};

const Search: NextPage<SearchProps> = ({ translations, chaptersData }): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const userTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string>('');
  const [selectedTranslations, setSelectedTranslations] = useState<string>(() =>
    userTranslations.join(','),
  );
  const [translationSearchQuery, setTranslationSearchQuery] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [exactMatchesOnly, setExactMatchOnly] = useState(true);
  const [searchResult, setSearchResult] = useState<VersesResponse>(null);
  const [feedbackVerseKey, setFeedbackVerseKey] = useState('');
  const toast = useToast();
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      languages: selectedLanguages,
      q: debouncedSearchQuery,
      translations: selectedTranslations,
    }),
    [currentPage, debouncedSearchQuery, selectedLanguages, selectedTranslations],
  );
  useAddQueryParamsToUrl('/search', queryParams);

  // We need this since pages that are statically optimized will be hydrated
  // without their route parameters provided, i.e query will be an empty object ({}).
  // After hydration, Next.js will trigger an update to provide the route parameters
  // in the query object. @see https://nextjs.org/docs/routing/dynamic-routes#caveats
  useEffect(() => {
    if (router.isReady) {
      if (router.query.q || router.query.query) {
        let query = router.query.q as string;
        if (router.query.query) {
          query = router.query.query as string;
        }
        setSearchQuery(query);
      }
      if (router.query.page) {
        setCurrentPage(Number(router.query.page));
      }
      if (router.query.languages) {
        setSelectedLanguages(router.query.languages as string);
      }
      if (router.query.translations) {
        setSelectedTranslations(router.query.translations as string);
      }
    }
  }, [router]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    setSearchQuery(newSearchQuery || '');
  };

  const onClearClicked = () => {
    logButtonClick('search_page_clear_query');
    setSearchQuery('');
  };

  /**
   * Call BE to fetch the results using the passed filters.
   *
   * @param {string} query
   * @param {number} page
   * @param {string} translation
   * @param {string} language
   */
  const getResults = useCallback(
    (query: string, page: number, translation: string, language: string) => {
      setIsSearching(true);
      logTextSearchQuery(query, 'search_page');
      getKalimatSearchResults({ query, exactMatchesOnly: exactMatchesOnly ? 1 : 0 })
        .then((kalimatResponse) => {
          if (kalimatResponse.length) {
            getFilteredVerses({
              filters: kalimatResponse
                .filter((result) => !result.isChapter)
                .map((result) => `${result.id}`)
                .join(','),
              fields: QuranFont.QPCHafs,
              filterLanguages: language,
              size: PAGE_SIZE,
              page,
              ...(translation && {
                translations: [translation],
                translationFields: 'text,resource_id,resource_name',
              }),
            })
              .then((response) => {
                if (response.status === 500) {
                  setHasError(true);
                } else {
                  setSearchResult({
                    ...response,
                    chapters: kalimatResponse
                      .filter((result) => result.isChapter)
                      .map((result) => `${result.id}`),
                  });
                }
              })
              .catch(() => {
                setHasError(true);
              })
              .finally(() => {
                setIsSearching(false);
              });
          } else {
            setSearchResult({
              pagination: {
                perPage: 1,
                currentPage: 1,
                nextPage: 1,
                totalRecords: 0,
                totalPages: 1,
              },
              verses: [],
            });
            setIsSearching(false);
          }
        })
        .catch(() => {
          setHasError(true);
          setIsSearching(false);
        });
    },
    [exactMatchesOnly],
  );

  // listen to any changes in the API params and call BE on change.
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      getResults(debouncedSearchQuery, currentPage, selectedTranslations, selectedLanguages);
    }
  }, [currentPage, debouncedSearchQuery, getResults, selectedLanguages, selectedTranslations]);

  const onPageChange = (page: number) => {
    logEvent('search_page_number_change');
    setCurrentPage(page);
  };

  const onTranslationChange = useCallback((translationIds: string[]) => {
    // convert the array into a string
    setSelectedTranslations((prevTranslationIds) => {
      const newTranslationIds = translationIds.join(',');
      logValueChange('search_page_selected_translations', prevTranslationIds, newTranslationIds);
      return newTranslationIds;
    });
    // reset the current page since most probable the results will change.
    setCurrentPage(1);
  }, []);

  const onSearchKeywordClicked = useCallback((keyword: string) => {
    setSearchQuery(keyword);
  }, []);

  const navigationUrl = '/search';

  const formattedSelectedTranslations = useMemo(() => {
    if (!selectedTranslations) return t('search:default-translations');

    let selectedValueString;

    const selectedTranslationsArray = selectedTranslations.split(',');

    const firstSelectedTranslation = translations.find(
      (translation) => translation.id.toString() === selectedTranslationsArray[0],
    );

    if (!firstSelectedTranslation) return t('search:all-translations');

    if (selectedTranslationsArray.length === 1) selectedValueString = firstSelectedTranslation.name;
    if (selectedTranslationsArray.length === 2)
      selectedValueString = t('settings.value-and-other', {
        value: firstSelectedTranslation?.name,
        othersCount: toLocalizedNumber(selectedTranslationsArray.length - 1, lang),
      });
    if (selectedTranslationsArray.length > 2)
      selectedValueString = t('settings.value-and-others', {
        value: firstSelectedTranslation?.name,
        othersCount: toLocalizedNumber(selectedTranslationsArray.length - 1, lang),
      });

    return selectedValueString;
  }, [lang, selectedTranslations, t, translations]);

  const filteredTranslations = translationSearchQuery
    ? filterTranslations(translations, translationSearchQuery)
    : translations;

  const onResetButtonClicked = () => {
    logButtonClick('search_page_reset_button');
    const defaultTranslations = getTranslationsInitialState(lang).selectedTranslations;
    onTranslationChange(defaultTranslations.map((translation) => translation.toString()));
  };

  const onTranslationSearchQueryChange = (newTranslationSearchQuery: string) => {
    logValueChange(
      'search_page_translation_search_query',
      translationSearchQuery,
      newTranslationSearchQuery,
    );
    setTranslationSearchQuery(newTranslationSearchQuery);
  };

  const onTranslationSearchClearClicked = () => {
    logButtonClick('search_page_translation_search_clear');
    setTranslationSearchQuery('');
  };

  const onFeedbackFormSubmitted = (data: { feedbackScore: number; comments: string }) => {
    const feedbackRequestParams = {
      query: debouncedSearchQuery,
      feedbackScore: data.feedbackScore,
      result: feedbackVerseKey,
    };
    submitKalimatSearchResultFeedback(feedbackRequestParams)
      .then(() => {
        setFeedbackVerseKey('');
        const textCopied = {
          ...feedbackRequestParams,
          result: `https://quran.com/${feedbackVerseKey}`,
          comments: data.comments,
        };
        clipboardCopy(JSON.stringify(textCopied, null, '  ')).then(() =>
          toast('Feedback submitted successfully and copied to clipboard', {
            status: ToastStatus.Success,
          }),
        );
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={
          debouncedSearchQuery !== ''
            ? t('search:search-title', {
                searchQuery: debouncedSearchQuery,
              })
            : t('search:search')
        }
        description={t('search:search-desc')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      <div className={styles.pageContainer}>
        <Modal
          isOpen={!!feedbackVerseKey}
          onClickOutside={() => {
            setFeedbackVerseKey('');
          }}
        >
          <Modal.Header>
            <span>
              <Link
                shouldPassHref
                href={`https://quran.com/${feedbackVerseKey}`}
                isNewTab
                shouldPrefetch={false}
                variant={LinkVariant.Highlight}
              >
                {feedbackVerseKey}
              </Link>
              {` ${t(`common:feedback`)}`}
            </span>
          </Modal.Header>
          <Modal.Body>
            <FormBuilder
              formFields={[
                {
                  field: 'feedbackScore',
                  label: 'Feedback Score (-1.0 -> 1.0)',
                  type: FormFieldType.Number,
                  rules: [
                    {
                      type: RuleType.Required,
                      value: true,
                      errorMessage: 'Feedback score is required',
                    },
                  ],
                  typeSpecificProps: {
                    max: 1,
                    min: -1,
                    step: 0.1,
                  },
                },
                {
                  field: 'comments',
                  label: 'Comments',
                  type: FormFieldType.Text,
                },
              ]}
              actionText="Submit"
              onSubmit={onFeedbackFormSubmitted}
            />
          </Modal.Body>
        </Modal>
        <div className={styles.headerOuterContainer}>
          <div className={styles.headerInnerContainer}>
            <Input
              id="searchQuery"
              prefix={<SearchIcon />}
              onChange={onSearchQueryChange}
              onClearClicked={onClearClicked}
              clearable
              value={searchQuery}
              disabled={isSearching}
              placeholder={t('search.title')}
              fixedWidth={false}
              variant={InputVariant.Main}
            />
            <ContentModal
              size={ContentModalSize.SMALL}
              isFixedHeight
              header={
                <div className={styles.modalContainer}>
                  <div className={styles.translationSearchContainer}>
                    <Input
                      id="searchQuery"
                      prefix={<SearchIcon />}
                      onChange={onTranslationSearchQueryChange}
                      onClearClicked={onTranslationSearchClearClicked}
                      clearable
                      value={translationSearchQuery}
                      placeholder={t('search.title')}
                      fixedWidth={false}
                      variant={InputVariant.Main}
                    />
                  </div>
                  <Button
                    className={styles.resetButton}
                    variant={ButtonVariant.Ghost}
                    onClick={onResetButtonClicked}
                  >
                    {t('search:reset')}
                  </Button>
                </div>
              }
              isOpen={isContentModalOpen}
              onClose={() => setIsContentModalOpen(false)}
            >
              <TranslationsFilter
                translations={filteredTranslations}
                selectedTranslations={selectedTranslations}
                onTranslationChange={onTranslationChange}
              />
            </ContentModal>
            <div className={styles.exactMatchContainer}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <p className={styles.exactMatchText}>Exact match only</p>
              <Toggle
                isChecked={exactMatchesOnly}
                onClick={() => {
                  setExactMatchOnly((prevExactMatch) => !prevExactMatch);
                }}
              />
            </div>
            <div className={styles.filtersContainer}>
              <Button
                onClick={() => setIsContentModalOpen(true)}
                size={ButtonSize.Small}
                variant={ButtonVariant.Compact}
                prefix={<FilterIcon />}
                className={styles.filterButton}
              >
                {t('search:filter')}
              </Button>
              <div>{formattedSelectedTranslations}</div>
            </div>
          </div>
        </div>
        <div className={styles.pageBody}>
          <div className={styles.searchBodyContainer}>
            <SearchBodyContainer
              onSearchKeywordClicked={onSearchKeywordClicked}
              isSearchDrawer={false}
              searchQuery={debouncedSearchQuery}
              searchResult={searchResult}
              currentPage={currentPage}
              onPageChange={onPageChange}
              pageSize={PAGE_SIZE}
              isSearching={isSearching}
              hasError={hasError}
              setFeedbackVerseKey={setFeedbackVerseKey}
            />
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const [availableLanguagesResponse, availableTranslationsResponse] = await Promise.all([
    getAvailableLanguages(locale),
    getAvailableTranslations(locale),
  ]);

  let translations = [];
  let languages = [];
  if (availableLanguagesResponse.status !== 500) {
    const { languages: responseLanguages } = availableLanguagesResponse;
    languages = responseLanguages;
  }
  if (availableTranslationsResponse.status !== 500) {
    const { translations: responseTranslations } = availableTranslationsResponse;
    translations = responseTranslations;
  }
  const chaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData,
      languages,
      translations,
    },
  };
};

export default Search;
