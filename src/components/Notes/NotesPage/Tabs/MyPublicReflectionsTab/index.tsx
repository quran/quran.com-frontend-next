import classNames from 'classnames';
import useSWRInfinite from 'swr/infinite';

import styles from './MyPublicReflectionsTab.module.scss';

import UserPublicReflectionsList from '@/components/Notes/NotesPage/Tabs/MyPublicReflectionsTab/UserPublicReflectionsList';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import Error from '@/pages/_error';
import GetUserReflectionsResponse from '@/types/auth/GetUserReflectionsResponse';
import { privateFetcher } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { makeGetUserReflectionsUrl } from '@/utils/auth/qf/apiPaths';

const PublicReflections = () => {
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
  const getKey = (pageIndex: number, previousPageData: GetUserReflectionsResponse) => {
    if (!isLoggedIn() || (previousPageData && !previousPageData.data)) return null;
    const page = pageIndex + 1;
    if (pageIndex === 0) {
      return makeGetUserReflectionsUrl({
        page,
      });
    }

    const { hasNextPage } = previousPageData.pagination;

    if (!hasNextPage) return null;

    return makeGetUserReflectionsUrl({
      page,
    });
  };

  const { data, size, setSize, isValidating, error } = useSWRInfinite<GetUserReflectionsResponse>(
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
    <UserPublicReflectionsList
      data={data}
      isValidating={isValidating}
      size={size}
      setSize={setSize}
    />
  );
};

export default PublicReflections;
