/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import getStore from '@/redux/store';
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

    const result = getSsrProps
      ? await getSsrProps({ ...context, store }, languageResult)
      : { props: {} };

    if ('props' in result) {
      return {
        ...result,
        props: {
          ...result.props,
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
