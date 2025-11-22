/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { logError } from '@/lib/newrelic';
import { logErrorToSentry } from '@/lib/sentry';
import getStore from '@/redux/store';
import Language from '@/types/Language';
import { getAllChaptersData } from '@/utils/chapter';
import { performLanguageDetection } from '@/utils/serverSideLanguageDetection';
import { GetSsrPropsWithRedux } from '@/utils/withSsrRedux.types';

export const REDUX_STATE_PROP_NAME = '__REDUX_STATE__';

const withSsrRedux =
  (pagePath: string, getSsrProps?: GetSsrPropsWithRedux) =>
  async (
    context: GetServerSidePropsContext<ParsedUrlQuery>,
  ): Promise<GetServerSidePropsResult<any>> => {
    const languageResult = await performLanguageDetection(context, pagePath);

    if (languageResult.shouldRedirect) {
      return {
        redirect: {
          destination: languageResult.redirectDestination,
          permanent: false,
        },
      };
    }

    const store = getStore(
      languageResult.detectedLanguage,
      languageResult.countryLanguagePreference,
      undefined,
      languageResult.detectedLanguage,
      languageResult.detectedCountry,
    );

    // Prefetch chaptersData so it is available inside page-level getServerSideProps logic.
    let chaptersData: any;
    let chaptersDataFailed = false;
    try {
      chaptersData = await getAllChaptersData(context.locale || Language.EN);
    } catch (e) {
      logErrorToSentry(e);
      logError(e);
      chaptersDataFailed = true;
      chaptersData = [];
    }

    const result = getSsrProps
      ? await getSsrProps({ ...context, store, chaptersData }, languageResult)
      : { props: {} };

    if ('props' in result) {
      return {
        ...result,
        props: {
          ...result.props,
          chaptersData, // enforce single source of truth
          ...(chaptersDataFailed && { chaptersDataFailed: true }),
          [REDUX_STATE_PROP_NAME]: store.getState(),
          ...(languageResult.countryLanguagePreference && {
            countryLanguagePreference: languageResult.countryLanguagePreference,
          }),
        },
      };
    }

    return result;
  };

export default withSsrRedux;
