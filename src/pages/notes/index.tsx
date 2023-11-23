/* eslint-disable max-lines */
import { useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import styles from './index.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import NoteModal from '@/components/Notes/NoteModal';
import NotesSorter from '@/components/Notes/NotesPage/NotesSorter/NotesSorter';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import ArrowLeft from '@/icons/west.svg';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { GetAllNotesResponse } from '@/types/auth/NotesByTypeAndTypeIdResponse';
import NotesSortOption from '@/types/NotesSortOptions';
import { privateFetcher } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getAllChaptersData } from '@/utils/chapter';
import { logValueChange } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getNotesNavigationUrl } from '@/utils/navigation';

const NotesPage = () => {
  useRequireAuth();

  const [sortBy, setSortBy] = useState(NotesSortOption.Newest);
  const [selectedNoteId, setSelectedNoteId] = useState(null); // for the note modal
  const { t, lang } = useTranslation();

  const sortOptions = [
    { id: NotesSortOption.Newest, label: t('newest') },
    { id: NotesSortOption.Oldest, label: t('oldest') },
  ];

  const onSortByChange = (newSortByVal) => {
    logValueChange('notes_page_sort_by', sortBy, newSortByVal);
    setSortBy(newSortByVal);
  };

  /**
   * Get the SWR key for cursor based pagination
   * - when the page index is still 0 (first fetch). get the bookmarkByCollection url without `cursor` param
   * - on the next fetch, add `cursor` to the parameters
   *
   * corner case
   * - when previous fetch contains empty data, stop fetching
   * - when the user is logged out, don't fetch the data
   *
   * Reference: https://swr.vercel.app/docs/pagination#useswrinfinite
   *
   * @returns {string} swr key
   */
  const getKey = (pageIndex, previousPageData) => {
    if (!isLoggedIn()) return null;
    if (previousPageData && !previousPageData.data) return null;
    if (pageIndex === 0) {
      return makeNotesUrl({
        sortBy,
      });
    }

    const cursor = previousPageData.pagination?.endCursor;
    return makeNotesUrl({
      sortBy,
      cursor,
    });
  };

  const { data, size, setSize, isValidating, error } = useSWRInfinite<GetAllNotesResponse>(
    getKey,
    privateFetcher,
  );

  if (error) {
    return <Error statusCode={403} />;
  }

  if (!data) {
    return (
      <div className={classNames(styles.container, styles.loadingContainer)}>
        <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
      </div>
    );
  }

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const notes = data.map((response) => response.data).flat();

  const loadMore = () => {
    setSize(size + 1);
  };

  const isLoadingMoreData = notes?.length > 0 && size > 1 && isValidating;

  const navigationUrl = getNotesNavigationUrl();

  return (
    <>
      <NextSeoWrapper
        title={t('common:notes.notes')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        nofollow
        noindex
      />
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.flow}>
          <div className={layoutStyles.flowItem}>
            <div className={styles.container}>
              <div className={styles.header}>
                <div className={styles.titleContainer}>
                  <Button href="/" variant={ButtonVariant.Ghost} hasSidePadding={false}>
                    <ArrowLeft />
                  </Button>
                  <h1>{t('common:notes.notes')}</h1>
                </div>
                <div>
                  <NotesSorter
                    options={sortOptions}
                    selectedOptionId={sortBy}
                    onChange={onSortByChange}
                  />
                </div>
              </div>

              <div className={styles.notesListContainer}>
                {selectedNoteId && (
                  <NoteModal
                    isOpen
                    onClose={() => setSelectedNoteId(null)}
                    noteId={selectedNoteId}
                  />
                )}

                {(notes || []).map((note) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    className={styles.note}
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                  </div>
                ))}
              </div>

              {isLoadingMoreData && <Spinner size={SpinnerSize.Large} />}
              {hasNextPage && (
                <div className={styles.loadMoreContainer} role="button">
                  <Button onClick={loadMore}>{t('collection:load-more')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default NotesPage;
