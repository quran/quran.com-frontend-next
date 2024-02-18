import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import styles from './MyPrivateNotesTab.module.scss';

import NotesList from '@/components/Notes/NotesPage/Tabs/MyPrivateNotesTab/NotesList';
import NotesSorter from '@/components/Notes/NotesPage/Tabs/MyPrivateNotesTab/NotesSorter/NotesSorter';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';
import { GetAllNotesResponse } from '@/types/auth/Note';
import NotesSortOption from '@/types/NotesSortOptions';
import { privateFetcher } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logValueChange } from '@/utils/eventLogger';

const PrivateNotes = () => {
  const [sortBy, setSortBy] = useState(NotesSortOption.Newest);

  const { t } = useTranslation();

  const sortOptions = [
    { id: NotesSortOption.Newest, label: t('common:newest') },
    { id: NotesSortOption.Oldest, label: t('common:oldest') },
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
  const getKey = (pageIndex: number, previousPageData: GetAllNotesResponse) => {
    if (!isLoggedIn() || (previousPageData && !previousPageData.data)) return null;
    if (pageIndex === 0) {
      return makeNotesUrl({
        sortBy,
        limit: 10,
      });
    }

    const { endCursor, hasNextPage } = previousPageData.pagination;

    if (!endCursor || !hasNextPage) return null;

    return makeNotesUrl({
      sortBy,
      cursor: endCursor,
      limit: 10,
    });
  };

  const { data, size, setSize, isValidating, error, mutate } = useSWRInfinite<GetAllNotesResponse>(
    getKey,
    (key) => {
      // append key to the response
      return privateFetcher(key).then((response) => {
        return {
          ...(response as any),
          key,
        };
      });
    },
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      revalidateOnMount: true,
    },
  );

  if (error) {
    return <Error statusCode={403} hasFullWidth={false} />;
  }

  if (!data) {
    return (
      <div className={classNames(styles.container, styles.loadingContainer)}>
        <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.sorterContainer}>
        <div className={styles.sorterInnerContainer}>
          <p className={styles.text}>{`${t('common:sort.by')}: `}</p>
          <NotesSorter options={sortOptions} selectedOptionId={sortBy} onChange={onSortByChange} />
        </div>
      </div>
      <NotesList
        data={data}
        isValidating={isValidating}
        size={size}
        setSize={setSize}
        mutateCache={mutate}
      />
    </>
  );
};

export default PrivateNotes;
