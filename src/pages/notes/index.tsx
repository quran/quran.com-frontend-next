/* eslint-disable max-lines */

import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import styles from './index.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import NotesList from '@/components/Notes/NotesPage/NotesList';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import ArrowLeft from '@/icons/west.svg';
import Error from '@/pages/_error';
import layoutStyles from '@/pages/index.module.scss';
import { GetAllNotesResponse } from '@/types/auth/Note';
import { privateFetcher } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getNotesNavigationUrl } from '@/utils/navigation';

const NotesPage = () => {
  useRequireAuth();
  const { t, lang } = useTranslation();

  const onBackButtonClicked = () => {
    logButtonClick('notes_page_back_button');
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
    const page = pageIndex + 1;
    if (pageIndex === 0) {
      return makeNotesUrl({
        page,
      });
    }

    const { hasNextPage } = previousPageData.pagination;

    if (!hasNextPage) return null;

    return makeNotesUrl({
      page,
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
    return <Error statusCode={403} />;
  }

  if (!data) {
    return (
      <div className={classNames(styles.container, styles.loadingContainer)}>
        <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
      </div>
    );
  }

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
                  <Button
                    onClick={onBackButtonClicked}
                    href="/"
                    variant={ButtonVariant.Ghost}
                    hasSidePadding={false}
                  >
                    <ArrowLeft />
                  </Button>
                  <h1>{t('common:notes.notes')}</h1>
                </div>
              </div>

              <NotesList
                data={data}
                isValidating={isValidating}
                size={size}
                setSize={setSize}
                mutateCache={mutate}
              />
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
